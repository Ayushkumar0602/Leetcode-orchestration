import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnnkhcqswoeqnghztpvh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkxODg5MiwiZXhwIjoyMDg4NDk0ODkyfQ.1t1U_yv6lloUu_Tgp-Mh7GgC_3ugH-RN34SrZNXvuyU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }
    console.log('Existing buckets:', buckets.map(b => b.name));

    const bucketName = 'resume';
    if (!buckets.find(b => b.name === bucketName)) {
        console.log(`Creating bucket ${bucketName}...`);
        const { data, error } = await supabase.storage.createBucket(bucketName, { public: false });
        if (error) {
            console.error('Error creating bucket:', error);
        } else {
            console.log('Bucket created:', data);
        }
    } else {
        console.log(`Bucket ${bucketName} already exists. Ensuring it is private.`);
        const { data, error } = await supabase.storage.updateBucket(bucketName, { public: false });
        console.log('Update result:', error ? error : 'success');
    }
}
setup();
