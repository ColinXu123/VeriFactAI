// Mock database of skeptical claims
export const skepticalClaims = [
  {
    _id: "1",
    text: 'A new study has revealed an astonishing finding: ' +
      'a simple fruit can cure cancer. According to the study, ' +
      'this remarkable discovery could revolutionize cancer ' +
      'treatment. Researchers claim that eating just one ' +
      'piece of this fruit daily eliminates cancer cells in body. ' +
      'The fruit is said to have powerful, natural healing ' +
      'properties.',
    highlight: 'astonishing finding',
    info: 'The highlighted claim is dubious. Consult credible sources to verify what is accurate.',
    isFactual: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: "2",
    text: 'Scientists have discovered a revolutionary weight loss technique. ' +
      'This groundbreaking method allows users to lose up to 30 pounds in just one week ' +
      'without diet or exercise. The technique is said to reprogram your metabolism ' +
      'and melt away fat while you sleep.',
    highlight: 'lose up to 30 pounds in just one week',
    info: 'This claim is not supported by medical science. Healthy weight loss typically occurs at a rate of 1-2 pounds per week.',
    isFactual: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: "3",
    text: 'A team of independent researchers found miracle minerals in this ' +
      'volcanic ash that can reverse aging by up to 20 years. ' +
      'Celebrities are keeping this secret to maintain their youthful appearance.',
    highlight: 'reverse aging by up to 20 years',
    info: 'These anti-aging claims are exaggerated and lack scientific evidence. No mineral has been proven to reverse aging.',
    isFactual: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: "4",
    text: 'This ancient herb discovered in the Amazon rainforest can ' +
      'completely eliminate diabetes in just 30 days. Patients who took this ' +
      'supplement were able to stop insulin injections permanently.',
    highlight: 'completely eliminate diabetes',
    info: 'There is no scientific evidence that any herb can cure diabetes. This claim could be dangerous for people with diabetes who require medical treatment.',
    isFactual: false,
    createdAt: new Date().toISOString()
  }
];

// Mock database of factual claims
export const factualClaims = [
  {
    _id: "5",
    text: 'Recent research from Harvard Medical School shows that ' +
      'certain fruits contain beneficial antioxidants that may help ' +
      'reduce cancer risk when consumed as part of a balanced diet. ' +
      'The research suggests that regular consumption of fruits and ' +
      'vegetables is associated with lower risks of certain types of cancer. ' +
      'Scientists emphasize that diet is just one factor among many that ' +
      'can influence cancer prevention.',
    highlight: 'may help reduce cancer risk',
    info: 'The highlighted statement is supported by scientific evidence and is presented accurately.',
    isFactual: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "6",
    text: 'A study published in the Journal of the American Medical Association found that ' +
      'regular physical activity can lower blood pressure by an average of 5-8 mmHg. ' +
      'Researchers recommend at least 150 minutes of moderate exercise per week for ' +
      'cardiovascular health benefits.',
    highlight: 'lower blood pressure by an average of 5-8 mmHg',
    info: 'This claim is based on peer-reviewed research and accurately represents the findings of multiple clinical studies.',
    isFactual: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "7",
    text: 'According to the World Health Organization, vaccines prevent an estimated ' +
      '2-3 million deaths every year from diseases such as diphtheria, tetanus, ' +
      'pertussis, influenza and measles. Vaccination is one of the most cost-effective ' +
      'ways to prevent disease.',
    highlight: '2-3 million deaths every year',
    info: 'This statistic is accurate and based on extensive global health data collected by health organizations.',
    isFactual: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "8",
    text: 'Research from the National Sleep Foundation indicates that adults need ' +
      'between 7-9 hours of sleep per night for optimal health. Consistent sleep ' +
      'deprivation is associated with increased risk of cardiovascular disease, ' +
      'obesity, and immune system dysfunction.',
    highlight: '7-9 hours of sleep per night',
    info: 'This recommendation is based on comprehensive sleep research and is recognized by medical professionals worldwide.',
    isFactual: true,
    createdAt: new Date().toISOString()
  }
]; 