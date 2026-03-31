// Initialize Pyodide exactly once
importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');

let pyodideReadyPromise = null;
let pyodide = null;

async function loadPyodideAndPackages() {
    self.postMessage({ type: 'STATUS', status: 'Loading Python runtime...' });
    
    // loadPyodide is globally available because of the importScripts above
    pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });

    self.postMessage({ type: 'STATUS', status: 'Loading packages (pandas, scikit-learn, matplotlib)...' });
    
    // Load standard ML packages
    await pyodide.loadPackage(['micropip', 'pandas', 'scikit-learn', 'matplotlib']);
    
    // Setup environment for capturing plots and stdout
    await pyodide.runPythonAsync(`
import sys
import io
import matplotlib.pyplot as plt
import base64

# Redirect stdout to capture print() statements
class StreamCapture(io.StringIO):
    def __init__(self, callback_name):
        super().__init__()
        self.callback_name = callback_name
    def write(self, s):
        super().write(s)
        import js
        getattr(js, self.callback_name)(s)

# This will hold printed output temporarily
sys.stdout = StreamCapture("publishStdout")
sys.stderr = StreamCapture("publishStderr")

# Helper to extract the current plot as base64 and clear it
def get_plot_as_base64():
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.clf() # Clear the figure so it doesn't leak to next cells
    return base64.b64encode(buf.read()).decode('utf-8')
    `);

    self.postMessage({ type: 'READY' });
}

// Keep track of which cell is currently running so stdout knows where to go
let currentRunningId = null;

// The Python setup calls this JS function whenever `print()` is used
self.publishStdout = (text) => {
    if (currentRunningId) {
        self.postMessage({ type: 'STDOUT', id: currentRunningId, text });
    }
};

self.publishStderr = (text) => {
    if (currentRunningId) {
        self.postMessage({ type: 'STDERR', id: currentRunningId, text });
    }
};

self.onmessage = async (event) => {
    const { type, id, code, filename, filedata } = event.data;

    // Initialization
    if (type === 'INIT') {
        if (!pyodideReadyPromise) {
            pyodideReadyPromise = loadPyodideAndPackages();
        }
        await pyodideReadyPromise;
        return;
    }

    // Write file to virtual FS
    if (type === 'WRITE_FILE') {
        try {
            await pyodideReadyPromise;
            pyodide.FS.writeFile(filename, filedata, { encoding: 'utf8' });
            self.postMessage({ type: 'FILE_WRITTEN', filename });
        } catch (err) {
            self.postMessage({ type: 'ERROR', id: null, error: 'Failed to save dataset locally' });
        }
        return;
    }

    // Run Cell
    if (type === 'RUN_CODE') {
        currentRunningId = id;
        try {
            await pyodideReadyPromise;
            
            // Run the code
            await pyodide.runPythonAsync(code);
            
            // Check if there's a matplotlib plot waiting to be shown
            // In a real notebook, user might call plt.show() or just plt.plot()
            const hasPlot = pyodide.runPython(`len(plt.get_fignums()) > 0`);
            let plotBase64 = null;
            if (hasPlot) {
                plotBase64 = pyodide.runPython(`get_plot_as_base64()`);
            }
            
            self.postMessage({ type: 'DONE', id, plotBase64 });
        } catch (error) {
            self.postMessage({ type: 'ERROR', id, error: error.message });
        } finally {
            currentRunningId = null;
        }
    }
};
