import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPsychometricTests() {
  // Crear prueba de personalidad Big Five
  const personalityTest = await prisma.psychometricTest.create({
    data: {
      name: 'Test de Personalidad Big Five',
      description: 'Evaluación de los cinco grandes factores de personalidad',
      category: 'personality',
      duration: 15,
      instructions: 'Responde cada pregunta según qué tan de acuerdo estés con cada afirmación. No hay respuestas correctas o incorrectas.',
    },
  });

  // Preguntas de personalidad
  const personalityQuestions = [
    { text: 'Soy una persona extrovertida y entusiasta', type: 'scale', order: 1 },
    { text: 'Soy una persona reservada', type: 'scale', order: 2 },
    { text: 'Soy una persona que confía en los demás', type: 'scale', order: 3 },
    { text: 'Tiendo a ser desorganizado/a', type: 'scale', order: 4 },
    { text: 'Me preocupo mucho', type: 'scale', order: 5 },
    { text: 'Tengo una imaginación activa', type: 'scale', order: 6 },
    { text: 'Tiendo a ser callado/a', type: 'scale', order: 7 },
    { text: 'Generalmente confío en las personas', type: 'scale', order: 8 },
    { text: 'Tiendo a ser perezoso/a', type: 'scale', order: 9 },
    { text: 'Soy emocionalmente estable, no me altero fácilmente', type: 'scale', order: 10 },
  ];

  for (const question of personalityQuestions) {
    await prisma.testQuestion.create({
      data: {
        testId: personalityTest.id,
        questionText: question.text,
        questionType: question.type,
        options: JSON.stringify([
          { value: 1, label: 'Totalmente en desacuerdo' },
          { value: 2, label: 'En desacuerdo' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'De acuerdo' },
          { value: 5, label: 'Totalmente de acuerdo' }
        ]),
        weight: 1.0,
        order: question.order,
      },
    });
  }

  // Crear prueba de inteligencia emocional
  const emotionalTest = await prisma.psychometricTest.create({
    data: {
      name: 'Test de Inteligencia Emocional',
      description: 'Evaluación de la capacidad para reconocer y manejar emociones',
      category: 'emotional',
      duration: 20,
      instructions: 'Lee cada situación y selecciona la respuesta que mejor describa cómo actuarías.',
    },
  });

  // Preguntas de inteligencia emocional
  const emotionalQuestions = [
    {
      text: 'Cuando un compañero de trabajo está visiblemente molesto, ¿qué haces?',
      type: 'multiple_choice',
      options: [
        { value: 'A', label: 'Lo ignoro para no meterme en problemas' },
        { value: 'B', label: 'Le pregunto si está bien y si puedo ayudar' },
        { value: 'C', label: 'Le doy espacio pero me mantengo disponible' },
        { value: 'D', label: 'Reporto la situación a mi supervisor' }
      ],
      order: 1
    },
    {
      text: 'Cuando recibo críticas constructivas, generalmente:',
      type: 'multiple_choice',
      options: [
        { value: 'A', label: 'Me siento atacado/a y me defiendo' },
        { value: 'B', label: 'Escucho y trato de aprender' },
        { value: 'C', label: 'Me siento mal pero no digo nada' },
        { value: 'D', label: 'Cuestiono las intenciones de quien critica' }
      ],
      order: 2
    },
    {
      text: 'En situaciones de estrés, yo:',
      type: 'multiple_choice',
      options: [
        { value: 'A', label: 'Pierdo el control fácilmente' },
        { value: 'B', label: 'Mantengo la calma y busco soluciones' },
        { value: 'C', label: 'Me paralizo y no sé qué hacer' },
        { value: 'D', label: 'Culpo a otros por la situación' }
      ],
      order: 3
    }
  ];

  for (const question of emotionalQuestions) {
    await prisma.testQuestion.create({
      data: {
        testId: emotionalTest.id,
        questionText: question.text,
        questionType: question.type,
        options: JSON.stringify(question.options),
        weight: 1.0,
        order: question.order,
      },
    });
  }

  console.log('Pruebas psicométricas creadas exitosamente');
  console.log('- Test de Personalidad Big Five:', personalityTest.id);
  console.log('- Test de Inteligencia Emocional:', emotionalTest.id);
}

seedPsychometricTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());