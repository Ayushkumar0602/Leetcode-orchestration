const { db } = require('./firebaseAdmin');

async function test() {
  const journeys = await db.collection('interviewJourneys').get();
  journeys.forEach(doc => {
    const data = doc.data();
    if(data.hrDetails) {
        console.log(`Journey ${doc.id}: hrDetails.questions = ${JSON.stringify(data.hrDetails.questions)}`);
    }
  });
}
test().catch(console.error);
