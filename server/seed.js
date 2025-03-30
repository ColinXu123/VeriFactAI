const mongoose = require('mongoose');
const Claim = require('./models/Claim');
require('dotenv').config();

// Skeptical Claims data
const skepticalClaimsData = [
  {
    text: 'A new study has revealed an astonishing finding: ' +
      'a simple fruit can cure cancer. According to the study, ' +
      'this remarkable discovery could revolutionize cancer ' +
      'treatment. Researchers claim that eating just one ' +
      'piece of this fruit daily eliminates cancer cells in body. ' +
      'The fruit is said to have powerful, natural healing ' +
      'properties.',
    highlight: 'astonishing finding',
    info: 'The highlighted claim is dubious. Consult credible sources to verify what is accurate.',
    explanation: 'This claim uses sensationalist language without citing specific research. No single food has been proven to "cure" cancer. Scientific consensus requires multiple peer-reviewed studies showing consistent results before making medical claims this significant. The vagueness about which fruit and lack of named researchers are red flags for misinformation.',
    isFactual: false
  },
  {
    text: 'Scientists have discovered a revolutionary weight loss technique. ' +
      'This groundbreaking method allows users to lose up to 30 pounds in just one week ' +
      'without diet or exercise. The technique is said to reprogram your metabolism ' +
      'and melt away fat while you sleep.',
    highlight: 'lose up to 30 pounds in just one week',
    info: 'This claim is not supported by medical science. Healthy weight loss typically occurs at a rate of 1-2 pounds per week.',
    explanation: 'This claim contradicts established medical knowledge about safe and sustainable weight loss. The promise of extreme results (30 pounds in one week) without effort (no diet or exercise) violates the laws of physics regarding caloric balance. The vague terms "revolutionary" and "reprogram your metabolism" are not scientifically meaningful and commonly used in weight loss scams.',
    isFactual: false
  },
  {
    text: 'A team of independent researchers found miracle minerals in this ' +
      'volcanic ash that can reverse aging by up to 20 years. ' +
      'Celebrities are keeping this secret to maintain their youthful appearance.',
    highlight: 'reverse aging by up to 20 years',
    info: 'These anti-aging claims are exaggerated and lack scientific evidence. No mineral has been proven to reverse aging.',
    explanation: 'This claim uses emotionally charged terms like "miracle" which is a red flag in scientific reporting. The aging process is complex and cannot be simply "reversed" by minerals. The appeal to unnamed "celebrities" and suggestion of secrecy are classic techniques used in pseudoscientific marketing to create artificial scarcity and exclusivity.',
    isFactual: false
  },
  {
    text: 'This ancient herb discovered in the Amazon rainforest can ' +
      'completely eliminate diabetes in just 30 days. Patients who took this ' +
      'supplement were able to stop insulin injections permanently.',
    highlight: 'completely eliminate diabetes',
    info: 'There is no scientific evidence that any herb can cure diabetes. This claim could be dangerous for people with diabetes who require medical treatment.',
    explanation: 'This claim could potentially harm people with diabetes who might stop taking prescribed medication. Diabetes (especially Type 1) is a chronic condition that typically requires ongoing medical management. The terms "ancient" and "discovered in the Amazon" exploit the appeal to nature and exotic origin fallacies. No credible medical organization recognizes any herbal supplement as a diabetes cure.',
    isFactual: false
  }
];

// Factual Claims data
const factualClaimsData = [
  {
    text: 'Recent research from Harvard Medical School shows that ' +
      'certain fruits contain beneficial antioxidants that may help ' +
      'reduce cancer risk when consumed as part of a balanced diet. ' +
      'The research suggests that regular consumption of fruits and ' +
      'vegetables is associated with lower risks of certain types of cancer. ' +
      'Scientists emphasize that diet is just one factor among many that ' +
      'can influence cancer prevention.',
    highlight: 'may help reduce cancer risk',
    info: 'The highlighted statement is supported by scientific evidence and is presented accurately.',
    explanation: 'This claim uses appropriate cautious language ("may help reduce," "associated with") that reflects the correlational nature of the research. It names a specific, credible institution (Harvard Medical School) and acknowledges the complexity of cancer prevention by mentioning "diet is just one factor." The claim doesn\'t promise prevention or cures, just risk reduction, which aligns with current scientific understanding.',
    isFactual: true
  },
  {
    text: 'A study published in the Journal of the American Medical Association found that ' +
      'regular physical activity can lower blood pressure by an average of 5-8 mmHg. ' +
      'Researchers recommend at least 150 minutes of moderate exercise per week for ' +
      'cardiovascular health benefits.',
    highlight: 'lower blood pressure by an average of 5-8 mmHg',
    info: 'This claim is based on peer-reviewed research and accurately represents the findings of multiple clinical studies.',
    explanation: 'This claim cites a specific, high-quality medical journal and provides precise numbers (5-8 mmHg) rather than vague statements. The recommendation of 150 minutes of exercise aligns with guidelines from major health organizations. The claim is modest and realistic about the benefits, using the term "can lower" rather than guaranteeing results for everyone.',
    isFactual: true
  },
  {
    text: 'According to the World Health Organization, vaccines prevent an estimated ' +
      '2-3 million deaths every year from diseases such as diphtheria, tetanus, ' +
      'pertussis, influenza and measles. Vaccination is one of the most cost-effective ' +
      'ways to prevent disease.',
    highlight: '2-3 million deaths every year',
    info: 'This statistic is accurate and based on extensive global health data collected by health organizations.',
    explanation: 'This claim cites a specific, authoritative source (World Health Organization) and provides a precise statistic with a reasonable range (2-3 million). It lists specific diseases prevented rather than making vague claims. The statement about cost-effectiveness is a well-established public health principle supported by decades of economic analyses.',
    isFactual: true
  },
  {
    text: 'Research from the National Sleep Foundation indicates that adults need ' +
      'between 7-9 hours of sleep per night for optimal health. Consistent sleep ' +
      'deprivation is associated with increased risk of cardiovascular disease, ' +
      'obesity, and immune system dysfunction.',
    highlight: '7-9 hours of sleep per night',
    info: 'This recommendation is based on comprehensive sleep research and is recognized by medical professionals worldwide.',
    explanation: 'This claim cites a relevant authority (National Sleep Foundation) and gives a specific, reasonable range of sleep hours. It uses appropriate scientific language like "associated with" rather than claiming direct causation. The claim lists specific health conditions linked to sleep deprivation, which is supported by large-scale epidemiological studies and scientific consensus.',
    isFactual: true
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing data
      await Claim.deleteMany({});
      console.log('Cleared existing claims');
      
      // Insert new data
      const skepticalClaims = await Claim.insertMany(skepticalClaimsData);
      console.log('Added skeptical claims:', skepticalClaims.length);
      
      const factualClaims = await Claim.insertMany(factualClaimsData);
      console.log('Added factual claims:', factualClaims.length);
      
      console.log('Database seeding completed!');
      
      // Disconnect from database
      mongoose.disconnect();
    } catch (error) {
      console.error('Error seeding database:', error);
      mongoose.disconnect();
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  }); 