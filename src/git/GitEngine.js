// src/git/GitEngine.js
// Pure JS Git simulation engine — no dependencies

const SCENARIOS = {
    blank: {
        name: 'Blank Repo',
        description: 'Start from scratch.',
        setup: null,
    },
    basic_branch: {
        name: 'Branch & Merge',
        description: 'Create a feature branch, commit changes, merge back to main.',
        goals: ['Create a branch named feature/login', 'Make a commit on it', 'Merge it into main'],
    },
    hotfix: {
        name: 'Hotfix Workflow',
        description: 'A bug was found in production. Create a hotfix branch from main and merge it.',
        goals: ['Create hotfix/bug-fix branch', 'Commit the fix', 'Merge into main'],
    },
    conflict: {
        name: 'Resolve a Conflict',
        description: 'Two branches edited the same line. Resolve the merge conflict.',
        goals: ['Merge feature into main', 'Resolve the conflict in index.html', 'Commit the merge'],
    },
    undo: {
        name: 'Undo a Commit',
        description: 'You committed something wrong. Practice reset and revert.',
        goals: ['Use git revert to undo the last commit'],
    },
};

function shortHash() {
    return Math.random().toString(36).slice(2, 9);
}

function linesOf(content) {
    return (content || '').split('\n');
}

function computeDiff(oldContent = '', newContent = '') {
    const oldLines = linesOf(oldContent);
    const newLines = linesOf(newContent);
    const result = [];
    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
        if (i >= oldLines.length) {
            result.push({ type: 'add', line: newLines[i], lineNum: i + 1 });
        } else if (i >= newLines.length) {
            result.push({ type: 'remove', line: oldLines[i], lineNum: i + 1 });
        } else if (oldLines[i] !== newLines[i]) {
            result.push({ type: 'remove', line: oldLines[i], lineNum: i + 1 });
            result.push({ type: 'add', line: newLines[i], lineNum: i + 1 });
        } else {
            result.push({ type: 'context', line: oldLines[i], lineNum: i + 1 });
        }
    }
    return result;
}

export class GitEngine {
    constructor() {
        this.reset();
    }

    reset() {
        this.commits = {};
        this.branches = {};
        this.HEAD = 'main';
        this.detached = false;
        this.stagingArea = {};
        this.workingTree = {
            'README.md': '# My Project\n\nWelcome to the Git Playground!\n',
        };
        this.stash = [];
        this.tags = {};

        // Create initial commit
        const initHash = shortHash();
        this.commits[initHash] = {
            hash: initHash,
            message: 'initial commit',
            parent: null,
            parents: [null],
            tree: { ...this.workingTree },
            author: 'Student',
            timestamp: Date.now() - 60000,
            branch: 'main',
        };
        this.branches['main'] = initHash;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    currentCommitHash() {
        if (this.detached) return this.HEAD;
        return this.branches[this.HEAD] || null;
    }

    currentTree() {
        const h = this.currentCommitHash();
        return h ? { ...this.commits[h].tree } : {};
    }

    getCommit(hash) {
        return this.commits[hash] || null;
    }

    // Walk ancestry: returns ordered array of hashes from given hash back to root
    ancestry(hash) {
        const chain = [];
        let cur = hash;
        const seen = new Set();
        while (cur && !seen.has(cur)) {
            seen.add(cur);
            chain.push(cur);
            const commit = this.commits[cur];
            if (!commit) break;
            cur = commit.parent;
        }
        return chain;
    }

    // Find lowest common ancestor of two commit hashes
    lca(hashA, hashB) {
        const ancestorsA = new Set(this.ancestry(hashA));
        for (const h of this.ancestry(hashB)) {
            if (ancestorsA.has(h)) return h;
        }
        return null;
    }

    isAncestor(potentialAncestor, of) {
        return this.ancestry(of).includes(potentialAncestor);
    }

    // ── Status ───────────────────────────────────────────────────────────────

    status() {
        const baseTree = this.currentTree();
        const allPaths = new Set([
            ...Object.keys(this.workingTree),
            ...Object.keys(baseTree),
            ...Object.keys(this.stagingArea),
        ]);

        const untracked = [];
        const modified = [];   // in workingTree but not yet staged
        const staged = [];     // in stagingArea
        const deleted = [];

        for (const path of allPaths) {
            const inBase = path in baseTree;
            const inWork = path in this.workingTree;
            const inStage = path in this.stagingArea;

            if (inStage) {
                staged.push(path);
            } else if (!inBase && inWork) {
                untracked.push(path);
            } else if (inBase && inWork && baseTree[path] !== this.workingTree[path]) {
                modified.push(path);
            } else if (inBase && !inWork && !inStage) {
                deleted.push(path);
            }
        }

        return {
            branch: this.detached ? `(HEAD detached at ${this.HEAD.slice(0, 7)})` : this.HEAD,
            staged,
            modified,
            untracked,
            deleted,
            clean: staged.length === 0 && modified.length === 0 && untracked.length === 0 && deleted.length === 0,
        };
    }

    // ── Git Commands ─────────────────────────────────────────────────────────

    cmd_status() {
        const s = this.status();
        const lines = [];
        lines.push(`On branch ${s.branch}`);
        if (s.clean) {
            lines.push('nothing to commit, working tree clean');
            return { ok: true, output: lines.join('\n') };
        }
        if (s.staged.length) {
            lines.push('\nChanges to be committed:');
            s.staged.forEach(f => lines.push(`  \x1b[green]new file / modified: ${f}\x1b[/]`));
        }
        if (s.modified.length) {
            lines.push('\nChanges not staged for commit:');
            s.modified.forEach(f => lines.push(`  \x1b[yellow]modified: ${f}\x1b[/]`));
        }
        if (s.deleted.length) {
            lines.push('\nDeleted files:');
            s.deleted.forEach(f => lines.push(`  \x1b[red]deleted: ${f}\x1b[/]`));
        }
        if (s.untracked.length) {
            lines.push('\nUntracked files:');
            s.untracked.forEach(f => lines.push(`  \x1b[gray]${f}\x1b[/]`));
        }
        return { ok: true, output: lines.join('\n') };
    }

    cmd_add(args) {
        const target = args[0];
        if (!target) return { ok: false, output: 'Nothing specified. Did you mean "git add ."?' };

        const baseTree = this.currentTree();
        const toStage = target === '.' ? Object.keys(this.workingTree) : [target];

        let count = 0;
        for (const path of toStage) {
            if (this.workingTree[path] !== undefined) {
                this.stagingArea[path] = this.workingTree[path];
                count++;
            }
        }

        // Stage deletions too
        if (target === '.') {
            for (const p of Object.keys(baseTree)) {
                if (!(p in this.workingTree)) {
                    this.stagingArea[p] = null; // null = deleted
                    count++;
                }
            }
        }

        if (count === 0) return { ok: false, output: `pathspec '${target}' did not match any files` };
        return { ok: true, output: `Changes staged: [${Object.keys(this.stagingArea).join(', ')}]` };
    }

    cmd_restore_staged(args) {
        const path = args[0];
        if (!path) return { ok: false, output: 'specify a file to unstage' };
        if (!(path in this.stagingArea)) return { ok: false, output: `'${path}' is not staged` };
        delete this.stagingArea[path];
        return { ok: true, output: `Unstaged: ${path}` };
    }

    cmd_commit(args) {
        // Parse: git commit -m "message"
        const mIdx = args.indexOf('-m');
        if (mIdx === -1 || !args[mIdx + 1]) return { ok: false, output: 'Please provide a commit message: git commit -m "your message"' };
        const message = args.slice(mIdx + 1).join(' ').replace(/^["']|["']$/g, '');

        const s = this.status();
        if (s.staged.length === 0 && !args.includes('--allow-empty')) {
            return { ok: false, output: 'nothing to commit (use "git add" to stage changes)' };
        }

        const parentHash = this.currentCommitHash();
        const baseTree = this.currentTree();

        // Apply staging area to tree
        const newTree = { ...baseTree };
        for (const [path, content] of Object.entries(this.stagingArea)) {
            if (content === null) delete newTree[path];
            else newTree[path] = content;
        }

        const h = shortHash();
        const branchName = this.detached ? null : this.HEAD;
        this.commits[h] = {
            hash: h,
            message,
            parent: parentHash,
            parents: [parentHash],
            tree: newTree,
            author: 'Student',
            timestamp: Date.now(),
            branch: branchName,
        };

        if (!this.detached) {
            this.branches[this.HEAD] = h;
        } else {
            this.HEAD = h;
        }

        this.stagingArea = {};
        return {
            ok: true,
            output: `[${this.detached ? h.slice(0, 7) : this.HEAD} ${h.slice(0, 7)}] ${message}\n  ${s.staged.length} file(s) changed`,
            newHash: h,
        };
    }

    cmd_branch(args) {
        if (args.length === 0) {
            // list branches
            const lines = Object.keys(this.branches).map(b =>
                b === this.HEAD && !this.detached ? `* ${b}` : `  ${b}`
            );
            return { ok: true, output: lines.join('\n') };
        }

        const flag = args[0];
        if (flag === '-d' || flag === '-D') {
            const name = args[1];
            if (!name) return { ok: false, output: 'branch name required' };
            if (name === this.HEAD) return { ok: false, output: `error: Cannot delete branch '${name}' checked out` };
            if (!this.branches[name]) return { ok: false, output: `error: branch '${name}' not found` };
            delete this.branches[name];
            return { ok: true, output: `Deleted branch ${name}` };
        }

        const name = args[0];
        if (this.branches[name]) return { ok: false, output: `fatal: A branch named '${name}' already exists` };
        this.branches[name] = this.currentCommitHash();
        return { ok: true, output: `Created branch '${name}'` };
    }

    cmd_checkout(args) {
        if (args.length === 0) return { ok: false, output: 'branch name required' };

        // git checkout -b <name>
        if (args[0] === '-b') {
            const name = args[1];
            if (!name) return { ok: false, output: 'branch name required after -b' };
            if (this.branches[name]) return { ok: false, output: `fatal: A branch named '${name}' already exists` };
            this.branches[name] = this.currentCommitHash();
            this.HEAD = name;
            this.detached = false;
            return { ok: true, output: `Switched to a new branch '${name}'` };
        }

        const target = args[0];

        // Check for uncommitted changes
        const s = this.status();
        if (s.staged.length > 0 || s.modified.length > 0) {
            return { ok: false, output: `error: Your local changes would be overwritten. Commit or stash them first.` };
        }

        // Checkout a branch
        if (this.branches[target] !== undefined) {
            this.HEAD = target;
            this.detached = false;
            const commitHash = this.branches[target];
            const commit = this.commits[commitHash];
            if (commit) this.workingTree = { ...commit.tree };
            return { ok: true, output: `Switched to branch '${target}'` };
        }

        // Checkout a commit hash (detached HEAD)
        if (this.commits[target]) {
            this.HEAD = target;
            this.detached = true;
            this.workingTree = { ...this.commits[target].tree };
            return { ok: true, output: `HEAD is now at ${target.slice(0, 7)}` };
        }

        return { ok: false, output: `error: pathspec '${target}' did not match any known branch or commit` };
    }

    cmd_merge(args) {
        const targetBranch = args[0];
        if (!targetBranch) return { ok: false, output: 'branch name required' };
        if (this.detached) return { ok: false, output: 'error: cannot merge in detached HEAD state' };
        if (!this.branches[targetBranch]) return { ok: false, output: `merge: ${targetBranch} - not something we can merge` };

        const headHash = this.branches[this.HEAD];
        const targetHash = this.branches[targetBranch];

        if (headHash === targetHash) return { ok: true, output: 'Already up to date.' };

        // Fast-forward: if HEAD is ancestor of target
        if (this.isAncestor(headHash, targetHash)) {
            this.branches[this.HEAD] = targetHash;
            const c = this.commits[targetHash];
            this.workingTree = { ...c.tree };
            return { ok: true, output: `Fast-forward\n  ${this.HEAD} → ${targetHash.slice(0, 7)}` };
        }

        // Three-way merge
        const lcaHash = this.lca(headHash, targetHash);
        const baseTree = lcaHash ? { ...this.commits[lcaHash].tree } : {};
        const headTree = { ...this.commits[headHash].tree };
        const targetTree = { ...this.commits[targetHash].tree };

        const allFiles = new Set([
            ...Object.keys(baseTree),
            ...Object.keys(headTree),
            ...Object.keys(targetTree),
        ]);

        const mergedTree = {};
        const conflicts = [];

        for (const file of allFiles) {
            const base = baseTree[file];
            const head = headTree[file];
            const target = targetTree[file];

            if (head === target) {
                if (head !== undefined) mergedTree[file] = head;
            } else if (head === base) {
                if (target !== undefined) mergedTree[file] = target;
            } else if (target === base) {
                if (head !== undefined) mergedTree[file] = head;
            } else {
                // Conflict
                conflicts.push(file);
                mergedTree[file] = [
                    '<<<<<<< HEAD',
                    head || '',
                    '=======',
                    target || '',
                    `>>>>>>> ${targetBranch}`,
                ].join('\n');
            }
        }

        this.workingTree = mergedTree;

        if (conflicts.length > 0) {
            // Stage with conflicts for the user to resolve
            this.stagingArea = { ...mergedTree };
            return {
                ok: false,
                conflict: true,
                conflictFiles: conflicts,
                output: `Auto-merging failed; fix conflicts in:\n${conflicts.map(f => `  CONFLICT: ${f}`).join('\n')}\nResolve conflicts, then run git commit.`,
            };
        }

        // Create merge commit
        const h = shortHash();
        this.commits[h] = {
            hash: h,
            message: `Merge branch '${targetBranch}' into ${this.HEAD}`,
            parent: headHash,
            parents: [headHash, targetHash],
            tree: mergedTree,
            author: 'Student',
            timestamp: Date.now(),
            branch: this.HEAD,
        };
        this.branches[this.HEAD] = h;

        return {
            ok: true,
            output: `Merge made by the 'recursive' strategy.\n  [${this.HEAD} ${h.slice(0, 7)}] Merge branch '${targetBranch}'`,
            newHash: h,
        };
    }

    cmd_log(args) {
        const oneline = args.includes('--oneline');
        const graph = args.includes('--graph');
        const chain = this.ancestry(this.currentCommitHash());

        const lines = chain.map(h => {
            const c = this.commits[h];
            const tags = Object.entries(this.tags).filter(([, v]) => v === h).map(([t]) => t);
            const branches = Object.entries(this.branches).filter(([, v]) => v === h).map(([b]) => b);
            const refs = [];
            if (branches.includes(this.HEAD) && !this.detached) refs.push(`HEAD → ${this.HEAD}`);
            refs.push(...branches.filter(b => b !== this.HEAD || this.detached));
            refs.push(...tags.map(t => `tag: ${t}`));
            const refStr = refs.length ? ` (${refs.join(', ')})` : '';

            if (oneline) return `${h.slice(0, 7)}${refStr} ${c.message}`;
            const date = new Date(c.timestamp).toLocaleString();
            return `commit ${h}${refStr}\nAuthor: ${c.author}\nDate:   ${date}\n\n    ${c.message}\n`;
        });

        if (graph) {
            return { ok: true, output: lines.map((l, i) => (i === 0 ? '* ' : '* ') + l).join('\n') };
        }
        return { ok: true, output: lines.join('\n') };
    }

    cmd_diff(args) {
        const staged = args.includes('--staged') || args.includes('--cached');
        const baseTree = this.currentTree();
        const compareTree = staged ? this.stagingArea : this.workingTree;
        const allFiles = new Set([...Object.keys(baseTree), ...Object.keys(compareTree)]);
        const diffs = [];

        for (const file of allFiles) {
            const oldContent = baseTree[file] || '';
            const newContent = compareTree[file] !== undefined ? compareTree[file] : null;
            if (oldContent === newContent) continue;
            diffs.push({ file, lines: computeDiff(oldContent, newContent ?? '') });
        }

        if (diffs.length === 0) return { ok: true, output: '(no differences)' };

        const output = diffs.map(d => {
            const lines = d.lines.map(l => {
                if (l.type === 'add') return `\x1b[green]+${l.line}\x1b[/]`;
                if (l.type === 'remove') return `\x1b[red]-${l.line}\x1b[/]`;
                return ` ${l.line}`;
            });
            return `diff --git a/${d.file} b/${d.file}\n${lines.join('\n')}`;
        }).join('\n\n');

        return { ok: true, output, diffData: diffs };
    }

    cmd_reset(args) {
        const hard = args.includes('--hard');
        const flag = args.find(a => a.startsWith('HEAD~'));
        const steps = flag ? parseInt(flag.split('~')[1] || '1') : 1;

        let cur = this.currentCommitHash();
        for (let i = 0; i < steps; i++) {
            const c = this.commits[cur];
            if (!c || !c.parent) return { ok: false, output: 'Already at root commit' };
            cur = c.parent;
        }

        this.branches[this.HEAD] = cur;
        if (hard) {
            this.workingTree = { ...this.commits[cur].tree };
            this.stagingArea = {};
        }
        return { ok: true, output: `HEAD is now at ${cur.slice(0, 7)}\n${hard ? '(hard reset: working tree updated)' : '(soft reset: changes preserved)'}` };
    }

    cmd_revert(args) {
        const targetHash = args[0];
        if (!targetHash) return { ok: false, output: 'commit hash required' };
        const fullHash = Object.keys(this.commits).find(h => h.startsWith(targetHash));
        if (!fullHash) return { ok: false, output: `fatal: commit '${targetHash}' not found` };

        const commit = this.commits[fullHash];
        const parentTree = commit.parent ? this.commits[commit.parent].tree : {};

        // Revert = apply inverse of commit's changes to HEAD tree
        const headTree = { ...this.currentTree() };
        for (const [file, content] of Object.entries(commit.tree)) {
            const parentContent = parentTree[file];
            if (parentContent === undefined) delete headTree[file];
            else headTree[file] = parentContent;
        }
        for (const file of Object.keys(parentTree)) {
            if (!(file in commit.tree)) headTree[file] = parentTree[file];
        }

        this.workingTree = headTree;
        this.stagingArea = { ...headTree };

        const h = shortHash();
        this.commits[h] = {
            hash: h,
            message: `Revert "${commit.message}"`,
            parent: this.currentCommitHash(),
            parents: [this.currentCommitHash()],
            tree: headTree,
            author: 'Student',
            timestamp: Date.now(),
            branch: this.HEAD,
        };
        this.branches[this.HEAD] = h;
        this.stagingArea = {};

        return { ok: true, output: `[${this.HEAD} ${h.slice(0, 7)}] Revert "${commit.message}"`, newHash: h };
    }

    cmd_stash(args) {
        const sub = args[0];

        if (!sub || sub === 'push') {
            const s = this.status();
            if (s.clean) return { ok: false, output: 'No local changes to save' };
            this.stash.push({
                message: `WIP on ${this.HEAD}: ${this.currentCommitHash()?.slice(0, 7)} ${this.commits[this.currentCommitHash()]?.message}`,
                workingTree: { ...this.workingTree },
                stagingArea: { ...this.stagingArea },
            });
            this.workingTree = { ...this.currentTree() };
            this.stagingArea = {};
            return { ok: true, output: `Saved working directory state: stash@{0}` };
        }

        if (sub === 'pop' || sub === 'apply') {
            if (this.stash.length === 0) return { ok: false, output: 'No stash entries found' };
            const entry = this.stash[this.stash.length - 1];
            this.workingTree = { ...entry.workingTree };
            this.stagingArea = { ...entry.stagingArea };
            if (sub === 'pop') this.stash.pop();
            return { ok: true, output: `Restored stash entry: ${entry.message}` };
        }

        if (sub === 'list') {
            if (this.stash.length === 0) return { ok: true, output: '(empty stash)' };
            return { ok: true, output: this.stash.map((s, i) => `stash@{${i}}: ${s.message}`).join('\n') };
        }

        if (sub === 'drop') {
            if (this.stash.length === 0) return { ok: false, output: 'No stash entries found' };
            this.stash.pop();
            return { ok: true, output: 'Dropped stash@{0}' };
        }

        return { ok: false, output: `Unknown subcommand: ${sub}` };
    }

    cmd_tag(args) {
        if (args.length === 0) {
            const tags = Object.keys(this.tags);
            return { ok: true, output: tags.length ? tags.join('\n') : '(no tags)' };
        }
        const name = args[0];
        const hash = args[1] ? Object.keys(this.commits).find(h => h.startsWith(args[1])) : this.currentCommitHash();
        if (!hash) return { ok: false, output: 'commit not found' };
        this.tags[name] = hash;
        return { ok: true, output: `Tagged '${name}' at ${hash.slice(0, 7)}` };
    }

    cmd_cherry_pick(args) {
        const targetShort = args[0];
        if (!targetShort) return { ok: false, output: 'commit hash required' };
        const fullHash = Object.keys(this.commits).find(h => h.startsWith(targetShort));
        if (!fullHash) return { ok: false, output: `commit '${targetShort}' not found` };

        const pick = this.commits[fullHash];
        const pickParentTree = pick.parent ? this.commits[pick.parent].tree : {};
        const headTree = { ...this.currentTree() };

        // Apply the diff of the picked commit onto HEAD
        for (const [file, content] of Object.entries(pick.tree)) {
            headTree[file] = content;
        }
        for (const file of Object.keys(pickParentTree)) {
            if (!(file in pick.tree)) delete headTree[file];
        }

        const h = shortHash();
        this.commits[h] = {
            hash: h,
            message: pick.message,
            parent: this.currentCommitHash(),
            parents: [this.currentCommitHash()],
            tree: headTree,
            author: 'Student',
            timestamp: Date.now(),
            branch: this.HEAD,
        };
        this.branches[this.HEAD] = h;
        this.workingTree = { ...headTree };

        return { ok: true, output: `[${this.HEAD} ${h.slice(0, 7)}] ${pick.message}`, newHash: h };
    }

    cmd_rebase(args) {
        const onto = args[0];
        if (!onto) return { ok: false, output: 'branch name required' };
        if (!this.branches[onto]) return { ok: false, output: `fatal: no such branch: ${onto}` };
        if (this.detached) return { ok: false, output: 'error: cannot rebase in detached HEAD' };

        const headHash = this.branches[this.HEAD];
        const ontoHash = this.branches[onto];
        const lcaHash = this.lca(headHash, ontoHash);

        // Commits to replay: ancestry of HEAD that are NOT in the target chain
        const ontoAncestors = new Set(this.ancestry(ontoHash));
        const toReplay = this.ancestry(headHash)
            .filter(h => !ontoAncestors.has(h))
            .reverse(); // oldest first

        if (toReplay.length === 0) return { ok: true, output: 'Already up to date.' };

        let newParent = ontoHash;
        const newHashes = [];

        for (const origHash of toReplay) {
            const origCommit = this.commits[origHash];
            const origParentTree = origCommit.parent ? this.commits[origCommit.parent].tree : {};
            const parentTree = this.commits[newParent].tree;

            // Apply diff of original commit onto new parent tree
            const newTree = { ...parentTree };
            for (const [file, content] of Object.entries(origCommit.tree)) {
                if (origParentTree[file] !== content) newTree[file] = content;
            }

            const h = shortHash();
            this.commits[h] = {
                hash: h,
                message: origCommit.message,
                parent: newParent,
                parents: [newParent],
                tree: newTree,
                author: origCommit.author,
                timestamp: Date.now(),
                branch: this.HEAD,
            };
            newParent = h;
            newHashes.push(h);
        }

        this.branches[this.HEAD] = newParent;
        this.workingTree = { ...this.commits[newParent].tree };

        return {
            ok: true,
            output: `Successfully rebased and updated refs/heads/${this.HEAD}.\n${newHashes.length} commit(s) replayed.`,
        };
    }

    // ── Command Dispatcher ────────────────────────────────────────────────────

    run(commandLine) {
        const parts = commandLine.trim().split(/\s+/);
        if (parts[0] === 'git') parts.shift();
        const cmd = parts[0];
        const args = parts.slice(1);

        switch (cmd) {
            case 'status': return this.cmd_status();
            case 'add': return this.cmd_add(args);
            case 'commit': return this.cmd_commit(args);
            case 'branch': return this.cmd_branch(args);
            case 'checkout': return this.cmd_checkout(args);
            case 'switch':
                if (args[0] === '-c') return this.cmd_checkout(['-b', ...args.slice(1)]);
                return this.cmd_checkout(args);
            case 'merge': return this.cmd_merge(args);
            case 'log': return this.cmd_log(args);
            case 'diff': return this.cmd_diff(args);
            case 'reset': return this.cmd_reset(args);
            case 'revert': return this.cmd_revert(args);
            case 'stash': return this.cmd_stash(args);
            case 'tag': return this.cmd_tag(args);
            case 'cherry-pick': return this.cmd_cherry_pick(args);
            case 'rebase': return this.cmd_rebase(args);
            case 'restore':
                if (args.includes('--staged')) {
                    const file = args.find(a => !a.startsWith('-'));
                    return this.cmd_restore_staged([file]);
                }
                return { ok: false, output: `restore: use --staged to unstage files` };
            case 'init':
                this.reset();
                return { ok: true, output: 'Initialized empty Git repository' };
            case 'help':
            case '--help':
                return {
                    ok: true,
                    output: [
                        'Available commands:',
                        '  git status              Show working tree status',
                        '  git add <file|.>        Stage changes',
                        '  git restore --staged <file>  Unstage a file',
                        '  git commit -m "msg"     Create a commit',
                        '  git branch [name]       List or create branches',
                        '  git branch -d <name>    Delete a branch',
                        '  git checkout <branch>   Switch branches',
                        '  git checkout -b <name>  Create and switch to branch',
                        '  git merge <branch>      Merge a branch into HEAD',
                        '  git log [--oneline][--graph]  Show commit history',
                        '  git diff [--staged]     Show changes',
                        '  git reset [--hard] HEAD~N  Move HEAD back N commits',
                        '  git revert <hash>       Create a revert commit',
                        '  git stash [pop|list|drop]  Stash working changes',
                        '  git tag <name>          Create a tag',
                        '  git cherry-pick <hash>  Copy a commit to HEAD',
                        '  git rebase <branch>     Rebase current branch onto another',
                        '  git init                Reinitialize repository',
                    ].join('\n'),
                };
            default:
                return { ok: false, output: `git: '${cmd}' is not a git command. See 'git help'.` };
        }
    }

    // ── Serialization ─────────────────────────────────────────────────────────

    toJSON() {
        return {
            commits: this.commits,
            branches: this.branches,
            HEAD: this.HEAD,
            detached: this.detached,
            stagingArea: this.stagingArea,
            workingTree: this.workingTree,
            stash: this.stash,
            tags: this.tags,
        };
    }

    fromJSON(data) {
        this.commits = data.commits || {};
        this.branches = data.branches || {};
        this.HEAD = data.HEAD || 'main';
        this.detached = data.detached || false;
        this.stagingArea = data.stagingArea || {};
        this.workingTree = data.workingTree || {};
        this.stash = data.stash || [];
        this.tags = data.tags || {};
    }

    // ── Graph data for rendering ──────────────────────────────────────────────

    getGraphData() {
        const headHash = this.currentCommitHash();
        const allHashes = Object.keys(this.commits);

        // Map commit hash → which branches point to it
        const commitBranches = {};
        const commitTags = {};
        for (const [b, h] of Object.entries(this.branches)) {
            if (!commitBranches[h]) commitBranches[h] = [];
            commitBranches[h].push(b);
        }
        for (const [t, h] of Object.entries(this.tags)) {
            if (!commitTags[h]) commitTags[h] = [];
            commitTags[h].push(t);
        }

        // Topological sort (Kahn's algorithm)
        const inDegree = {};
        const children = {};
        for (const h of allHashes) {
            inDegree[h] = inDegree[h] || 0;
            children[h] = children[h] || [];
            const c = this.commits[h];
            for (const p of (c.parents || [c.parent]).filter(Boolean)) {
                children[p] = children[p] || [];
                children[p].push(h);
                inDegree[h] = (inDegree[h] || 0) + 1;
            }
        }

        const queue = allHashes.filter(h => inDegree[h] === 0);
        const sorted = [];
        while (queue.length) {
            const h = queue.shift();
            sorted.push(h);
            for (const child of children[h] || []) {
                inDegree[child]--;
                if (inDegree[child] === 0) queue.push(child);
            }
        }

        // Assign lanes (one per branch)
        const laneMap = {}; // commit hash → lane index
        const branchLanes = {}; // branch name → lane
        let nextLane = 0;
        const branchOrder = ['main', ...Object.keys(this.branches).filter(b => b !== 'main')];
        for (const b of branchOrder) {
            if (this.branches[b]) branchLanes[b] = nextLane++;
        }
        for (const h of sorted) {
            const branches = commitBranches[h] || [];
            if (branches.length > 0) {
                laneMap[h] = Math.min(...branches.map(b => branchLanes[b] ?? nextLane++));
            } else {
                laneMap[h] = 0;
            }
        }

        const nodes = sorted.reverse().map((h, i) => ({
            hash: h,
            shortHash: h.slice(0, 7),
            message: this.commits[h].message,
            author: this.commits[h].author,
            timestamp: this.commits[h].timestamp,
            parents: (this.commits[h].parents || [this.commits[h].parent]).filter(Boolean),
            branches: commitBranches[h] || [],
            tags: commitTags[h] || [],
            isHead: h === headHash,
            isCurrentBranch: (commitBranches[h] || []).includes(this.HEAD) && !this.detached,
            lane: laneMap[h] || 0,
            x: 0, // will be set by renderer
            y: 0,
        }));

        return { nodes, branchLanes, headBranch: this.HEAD };
    }

    static SCENARIOS = SCENARIOS;
}



