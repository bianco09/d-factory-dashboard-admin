const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBocasDelToroTour() {
  console.log('🌱 Creating Bocas del Toro tour...');

  try {
    // Create the main tour
    const tour = await prisma.tour.create({
      data: {
        title: "PAQUETE TURISTA SUPERIOR - Bocas del Toro",
        description: `Disfruta 4 días y 3 noches en el hermoso archipiélago de Bocas del Toro, Panamá. 

Una experiencia inolvidable en aguas cristalinas y playas paradisíacas con alojamiento en Hotel Playa Tortuga. 

Incluye tours de delfines, Cayo Coral, Playa Estrellas, transporte completo terrestre y marítimo, y coordinación grupal especializada desde Costa Rica.

**Hotel:** Playa Tortuga
**Fechas:** Del 09 al 12 de octubre de 2025
**Precio por persona:** $485.00 (habitación doble)

¡Una aventura completa en uno de los destinos más hermosos de Centroamérica!

**TÉRMINOS Y CONDICIONES:**
- Precio sujeto a cambios
- Máximo ocupación: 3 adultos + 1 niño o 2 adultos + 2 niños por habitación
- Tarifa niños 0-7 años en habitación con adultos
- Depósito garantía: $100 USD por persona (no reembolsable)
- Pago final 15 días antes de salida
- Cancelación sin penalidad hasta 15 días antes

**CONTACTO:** analoreherrera@hotmail.com`,
        location: "Bocas del Toro, Panamá",
        days: 4,
        price: 485.00,
        type: "multi",
        startDate: new Date("2025-10-09T00:00:00.000Z"),
        endDate: new Date("2025-10-12T23:59:59.000Z"),
        categories: ["Adventure", "Nature", "Beach", "Cultural"],
        included: [
          "Transporte terrestre en unidades oficiales de turismo",
          "Transporte marítimo en lanchas equipadas con chalecos salvavidas",
          "3 noches en Hotel Playa Tortuga",
          "Desayunos diarios en hotel",
          "Refrigerio día de ida",
          "Tour Bahía de los Delfines",
          "Tour Cayo Coral con almuerzo",
          "Tour Bocas del Drago - Playa Estrellas",
          "2 almuerzos en playa durante tours",
          "Coordinación grupal especializada desde Costa Rica",
          "Chalecos salvavidas",
          "Entrada a Zapatilla, Red Frog o Isla Popa incluida",
          "Impuesto ICT sobre la porción terrestre del viaje"
        ],
        excluded: [
          "Comidas no estipuladas",
          "Impuesto de salida terrestre de Costa Rica ($8-$10)",
          "Impuesto salida y entrada Panamá ($4)",
          "Seguro de viajero",
          "Gastos personales",
          "Propinas a guía y chofer",
          "Bebidas adicionales no especificadas",
          "Actividades opcionales",
          "Equipo de snorkel (costo adicional)"
        ],
        status: "published",
        completionPercentage: 100
      }
    });

    console.log('✅ Tour created:', {
      id: tour.id,
      title: tour.title,
      days: tour.days,
      price: tour.price
    });

    // Create detailed day plans
    const dayPlans = [
      {
        day: 1,
        title: "¡BIENVENIDOS ABORDO! - Salida y Llegada a Bocas del Toro",
        description: `**SALIDA DEL TOUR:**
• Puntos y horas de abordaje aproximados:
  - Palmares 12:30 AM
  - San Ramón 12:40 AM  
  - Aeropuerto 1:30 AM
  - Hard Rock Cariari 1:40 AM
  - San José SODA TAPIA 2:00 AM

**TRAYECTO:**
• Desayuno incluido (en restaurante o abordo según temporada)
• Llegada a la Frontera Sixaola (Costa Rica) - Guabito (Panamá)
• Trámites migratorios personales
• 30 minutos de compras en frontera
• Llegada a Almirante, puerto de embarque
• Traslado en lanchas (taxis acuáticos) 25-30 minutos hasta Isla Colón

**LLEGADA A BOCAS DEL TORO:**
• Llegada aproximadamente 1:00 PM a Isla Colón
• Entrega de habitaciones en Hotel Playa Tortuga
• **Opcional:** Tarde en Isla Carenero - Bibis On the Beach para disfrutar atardecer
• Tarde y noche libre`,
        included: [
          "Transporte terrestre desde puntos de salida",
          "Desayuno durante el trayecto", 
          "Traslado marítimo a Isla Colón",
          "Check-in Hotel Playa Tortuga",
          "Coordinación grupal"
        ]
      },
      {
        day: 2,
        title: "¡El archipiélago nos sorprende! - Tour Bahía de los Delfines y Cayo Coral",
        description: `**MAÑANA:**
• Desayuno incluido en restaurante principal del hotel
• Salida 9:00 AM Tour Bahía de los Delfines

**RECORRIDO MARÍTIMO:**
• Recorriendo el bello Archipiélago de Bocas del Toro
• Isla San Cristóbal
• Laguna de Bocatorito  
• Isla Popa
• Llegada a Cayo Coral (icono de Bocas del Toro)

**ACTIVIDADES EN CAYO CORAL:**
• Tour Cayo Coral
• Opción de snorkel y kayak (equipo con costo adicional)
• Tiempo para disfrute y relajación

**TARDE:**
• Almuerzo incluido + 1 bebida
• Visita a UNO de estos destinos (según clima):
  - Isla Zapatilla (entrada $10 adicional si se visita)
  - Red Frog
  - Isla Popa
• Recorrido de regreso observando Isla Bastimentos, Punta Hospital, Isla Solarte e Isla Carenero
• Regreso al hotel 4:00-5:00 PM
• Noche libre`,
        included: [
          "Desayuno en hotel",
          "Tour Bahía de los Delfines",
          "Tour Cayo Coral",
          "Almuerzo + 1 bebida",
          "Entrada a una isla (Zapatilla/Red Frog/Isla Popa)",
          "Transporte marítimo completo"
        ]
      },
      {
        day: 3,
        title: "¡Descubriendo el magnífico lugar! - Tour Bocas del Drago y Playa Estrellas",
        description: `**MAÑANA:**
• Desayuno incluido en restaurante principal del hotel
• Salida 9:00 AM Tour Bocas del Drago - Playa Estrellas

**RECORRIDO:**
• Recorrido marítimo por diferentes puntos del archipiélago
• Paso por Hotel Punta Caracol (icono del destino de Bocas del Toro)
• *Posibilidad de recorrido terrestre si la operación lo amerita

**PLAYA ESTRELLAS:**
• Tiempo completo para disfrutar en esta hermosa playa
• Piscina natural única
• Relajación y actividades acuáticas

**TARDE:**
• Almuerzo incluido + 1 bebida en la playa
• Más tiempo libre en Playa Estrellas
• Regreso al hotel 4:00 PM
• Noche libre`,
        included: [
          "Desayuno en hotel",
          "Tour Bocas del Drago",
          "Visita completa a Playa Estrellas",
          "Almuerzo + 1 bebida en playa",
          "Transporte marítimo/terrestre"
        ]
      },
      {
        day: 4,
        title: "¡Regreso a Costa Rica! - Culminando una experiencia inolvidable",
        description: `**MAÑANA:**
• Desayuno incluido 8:00 AM en restaurante principal del hotel
  (Dependiendo de temporada, desayuno puede realizarse en Changuinola)
• Salida de Bocas del Toro (Isla Colón) 9:00 AM hacia Almirante
  (Hora puede variar según temporada)

**REGRESO:**
• Traslado marítimo a Almirante
• Viaje terrestre a frontera Sixaola
• Trámites de frontera personales
• Almuerzo en Limón (NO incluido)

**LLEGADA:**
• Llegada a San José aproximadamente 5:00-6:00 PM
• Finalización del tour en puntos de llegada

**NOTAS IMPORTANTES:**
• Máximo ocupación: hasta 3 adultos + 1 niño, o 2 adultos + 2 niños por habitación
• Tarifa de niños solo para menores 0-7 años en habitación con adultos
• Hoteles pueden variar según disponibilidad manteniendo calidad`,
        included: [
          "Desayuno en hotel o Changuinola",
          "Traslado marítimo a Almirante", 
          "Transporte terrestre a Costa Rica",
          "Coordinación hasta San José"
        ]
      }
    ];

    // Insert all day plans
    for (const dayPlan of dayPlans) {
      await prisma.tourPlan.create({
        data: {
          tourId: tour.id,
          day: dayPlan.day,
          title: dayPlan.title,
          description: dayPlan.description,
          included: dayPlan.included
        }
      });
      
      console.log(`✅ Day ${dayPlan.day} plan created: ${dayPlan.title}`);
    }

    console.log('🎉 Bocas del Toro tour created successfully!');
    console.log('\n📝 Tour Details:');
    console.log(`ID: ${tour.id}`);
    console.log(`Title: ${tour.title}`);
    console.log(`Location: ${tour.location}`);
    console.log(`Duration: ${tour.days} days`);
    console.log(`Price: $${tour.price}`);
    console.log(`Dates: ${tour.startDate.toDateString()} - ${tour.endDate.toDateString()}`);
    console.log(`Categories: ${tour.categories.join(', ')}`);
    console.log(`Status: ${tour.status}`);
    console.log(`\n🗓️ Day Plans: ${dayPlans.length} days created`);

  } catch (error) {
    console.error('❌ Error creating tour:', error);
    throw error;
  }
}

createBocasDelToroTour()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
