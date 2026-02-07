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
      sentence_id: '0',
      model_a: 'styletts2',
      model_b: 'roboshaul',
      naturalness_cmos: 2,
      accuracy_cmos: -1
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
