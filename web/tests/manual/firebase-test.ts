import { submitSubmission, exportToCSV } from '../../lib/firebase';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'submit') {
    // Test submission
    console.log('Testing submission...');
    await submitSubmission({
      email: 'test@example.com',
      q_id: 1,
      model: 'gemini',
      naturalness: 4,
      accuracy: 5
    });
    console.log('Submission successful!');
  }
  else if (command === 'export') {
    // Test export
    console.log('Exporting to CSV...');
    const csv = await exportToCSV();
    console.log('\n--- CSV Output ---\n');
    console.log(csv);
    console.log('\n--- End CSV ---\n');
  }
  else {
    console.log('Usage:');
    console.log('  pnpx tsx tests/manual/firebase-test.ts submit   - Test submitting a rating');
    console.log('  pnpx tsx tests/manual/firebase-test.ts export   - Export all submissions to CSV');
  }
}

main().catch(console.error);
