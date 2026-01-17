import { submitSubmission, exportToCSV } from '../../src/lib/firebase';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'submit') {
    // Test submission
    console.log('Testing submission...');
    await submitSubmission({
      name: 'Test User',
      email: 'test@example.com',
      sentence_id: 'gold_000_line_012',
      model: 'gemini_unvocalized',
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
