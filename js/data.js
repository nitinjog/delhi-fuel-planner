// Vehicle database — ARAI certified mileage (kmpl), null = variant not available
const VEHICLES = {
  '2wheeler': {
    brands: {
      'Hero': {
        models: {
          'Splendor Plus':    { petrol: 75,   diesel: null },
          'HF Deluxe':        { petrol: 83,   diesel: null },
          'Passion Pro':      { petrol: 70,   diesel: null },
          'Glamour':          { petrol: 55,   diesel: null },
          'Xtreme 160R':      { petrol: 45,   diesel: null },
          'Xoom 110':         { petrol: 65,   diesel: null },
        }
      },
      'Honda': {
        models: {
          'Activa 6G':        { petrol: 60,   diesel: null },
          'SP 125':           { petrol: 65,   diesel: null },
          'Shine 125':        { petrol: 65,   diesel: null },
          'Unicorn 160':      { petrol: 55,   diesel: null },
          'Hornet 2.0':       { petrol: 40,   diesel: null },
          'CB200X':           { petrol: 37,   diesel: null },
        }
      },
      'TVS': {
        models: {
          'Jupiter 125':      { petrol: 62,   diesel: null },
          'Raider 125':       { petrol: 67,   diesel: null },
          'Star City+':       { petrol: 64,   diesel: null },
          'Apache RTR 160 4V':{ petrol: 45,   diesel: null },
          'Ntorq 125':        { petrol: 56,   diesel: null },
          'Apache RTR 200 4V':{ petrol: 35,   diesel: null },
        }
      },
      'Bajaj': {
        models: {
          'CT 110':           { petrol: 80,   diesel: null },
          'Platina 110 H-Gear':{ petrol: 80,  diesel: null },
          'Pulsar 125':       { petrol: 55,   diesel: null },
          'Pulsar 150':       { petrol: 45,   diesel: null },
          'Pulsar NS160':     { petrol: 40,   diesel: null },
          'Dominar 400':      { petrol: 30,   diesel: null },
        }
      },
      'Royal Enfield': {
        models: {
          'Hunter 350':       { petrol: 36,   diesel: null },
          'Classic 350':      { petrol: 35,   diesel: null },
          'Meteor 350':       { petrol: 35,   diesel: null },
          'Bullet 350':       { petrol: 35,   diesel: null },
          'Himalayan 450':    { petrol: 28,   diesel: null },
        }
      },
      'Yamaha': {
        models: {
          'FZ-S V3':          { petrol: 45,   diesel: null },
          'FZ-X':             { petrol: 45,   diesel: null },
          'Ray ZR 125':       { petrol: 47,   diesel: null },
          'MT-15 V2':         { petrol: 40,   diesel: null },
          'R15 V4':           { petrol: 40,   diesel: null },
        }
      },
      'Suzuki': {
        models: {
          'Access 125':       { petrol: 63,   diesel: null },
          'Burgman Street 125':{ petrol: 58,  diesel: null },
          'Gixxer 150':       { petrol: 50,   diesel: null },
          'Gixxer SF 250':    { petrol: 38,   diesel: null },
        }
      },
      'KTM': {
        models: {
          'Duke 125':         { petrol: 42,   diesel: null },
          'Duke 200':         { petrol: 35,   diesel: null },
          'Duke 390':         { petrol: 28,   diesel: null },
          'RC 390':           { petrol: 28,   diesel: null },
        }
      },
    }
  },

  '4wheeler': {
    brands: {
      'Maruti Suzuki': {
        models: {
          'Alto K10':         { petrol: 24.9,  diesel: null },
          'S-Presso':         { petrol: 24.12, diesel: null },
          'Celerio':          { petrol: 26.68, diesel: null },
          'Swift':            { petrol: 23.2,  diesel: 28.5 },
          'Dzire':            { petrol: 23.26, diesel: 31.12 },
          'Baleno':           { petrol: 22.35, diesel: null },
          'Ignis':            { petrol: 20.89, diesel: null },
          'Ertiga':           { petrol: 19.34, diesel: 26.11 },
          'Brezza':           { petrol: 17.38, diesel: 23.76 },
          'Grand Vitara':     { petrol: 19.38, diesel: 26.12 },
          'Fronx':            { petrol: 21.79, diesel: 26.26 },
          'Jimny':            { petrol: 16.39, diesel: null },
        }
      },
      'Hyundai': {
        models: {
          'i10 Nios':         { petrol: 20.7,  diesel: null },
          'i20':              { petrol: 20.35, diesel: 25.17 },
          'Venue':            { petrol: 18.15, diesel: 23.43 },
          'Creta':            { petrol: 16.8,  diesel: 21.4 },
          'Verna':            { petrol: 17.0,  diesel: 25.0 },
          'Alcazar':          { petrol: 14.5,  diesel: 20.04 },
          'Tucson':           { petrol: 14.0,  diesel: 18.0 },
        }
      },
      'Tata': {
        models: {
          'Tiago':            { petrol: 19.8,  diesel: 24.34 },
          'Tigor':            { petrol: 19.8,  diesel: 24.32 },
          'Punch':            { petrol: 18.97, diesel: null },
          'Nexon':            { petrol: 17.44, diesel: 22.96 },
          'Altroz':           { petrol: 19.05, diesel: 25.11 },
          'Harrier':          { petrol: null,  diesel: 14.6 },
          'Safari':           { petrol: null,  diesel: 14.7 },
        }
      },
      'Mahindra': {
        models: {
          'XUV300':           { petrol: 17.56, diesel: 23.4 },
          'Scorpio N':        { petrol: 14.43, diesel: 16.3 },
          'XUV700':           { petrol: 14.07, diesel: 16.1 },
          'Thar':             { petrol: 14.3,  diesel: 17.9 },
          'BE 6':             { petrol: null,  diesel: null }, // EV, skip
          'Bolero':           { petrol: null,  diesel: 16.7 },
        }
      },
      'Honda': {
        models: {
          'Amaze':            { petrol: 18.6,  diesel: 27.4 },
          'City':             { petrol: 18.4,  diesel: 24.1 },
          'Elevate':          { petrol: 15.26, diesel: null },
          'WR-V':             { petrol: 17.4,  diesel: 23.7 },
        }
      },
      'Toyota': {
        models: {
          'Glanza':           { petrol: 22.35, diesel: null },
          'Hyryder':          { petrol: 19.38, diesel: 26.12 },
          'Urban Cruiser':    { petrol: 17.03, diesel: 23.76 },
          'Innova Crysta':    { petrol: 11.26, diesel: 17.09 },
          'Fortuner':         { petrol: 10.9,  diesel: 14.08 },
        }
      },
      'Kia': {
        models: {
          'Sonet':            { petrol: 18.4,  diesel: 24.1 },
          'Seltos':           { petrol: 16.5,  diesel: 21.5 },
          'Carens':           { petrol: 16.5,  diesel: 21.5 },
          'EV6':              { petrol: null,  diesel: null }, // EV
        }
      },
      'Renault': {
        models: {
          'Kwid':             { petrol: 22.3,  diesel: null },
          'Kiger':            { petrol: 20.89, diesel: null },
          'Triber':           { petrol: 18.87, diesel: null },
        }
      },
      'Volkswagen': {
        models: {
          'Polo':             { petrol: 18.7,  diesel: null },
          'Virtus':           { petrol: 17.7,  diesel: null },
          'Taigun':           { petrol: 17.71, diesel: null },
        }
      },
      'Skoda': {
        models: {
          'Rapid':            { petrol: 18.97, diesel: null },
          'Slavia':           { petrol: 17.8,  diesel: null },
          'Kushaq':           { petrol: 17.73, diesel: null },
        }
      },
      'MG': {
        models: {
          'Hector':           { petrol: 15.81, diesel: 18.77 },
          'Astor':            { petrol: 15.51, diesel: null },
          'Gloster':          { petrol: null,  diesel: 13.35 },
        }
      },
      'Nissan': {
        models: {
          'Magnite':          { petrol: 20.89, diesel: null },
        }
      },
    }
  }
};

// Delhi NCR weekday traffic index by hour (0 = midnight, index 0-23)
// 0 = no traffic, 1 = worst gridlock
const WEEKDAY_TRAFFIC = [
  0.05, 0.05, 0.05, 0.05, 0.10, 0.25,
  0.55, 0.80, 0.95, 1.00, 0.85, 0.65,
  0.70, 0.65, 0.60, 0.65, 0.80, 0.92,
  1.00, 0.95, 0.78, 0.55, 0.35, 0.15
];

// Weekend traffic (generally lighter, with mid-day and evening peaks)
const WEEKEND_TRAFFIC = [
  0.05, 0.05, 0.05, 0.05, 0.08, 0.15,
  0.25, 0.35, 0.50, 0.65, 0.75, 0.80,
  0.85, 0.80, 0.70, 0.75, 0.80, 0.85,
  0.90, 0.85, 0.72, 0.55, 0.35, 0.15
];

// Fuel prices Delhi (May 2025, approximate ₹/litre)
const FUEL_PRICES = {
  petrol: 94.72,
  diesel: 87.62
};

// CO2 emissions kg per litre
const CO2_PER_LITRE = {
  petrol: 2.31,
  diesel: 2.68
};

// Idle fuel consumption rate (L/sec)
const IDLE_RATE = {
  '2wheeler_petrol': 0.000083,
  '4wheeler_petrol': 0.000150,
  '4wheeler_diesel': 0.000120
};

// Average representative vehicle mileage for comparison
const COMPARISON_VEHICLES = [
  { label: '🛵 Efficient 2-Wheeler',  type: '2wheeler', petrol: 75,   diesel: null,  example: 'e.g. Hero HF Deluxe' },
  { label: '🛵 Average 2-Wheeler',    type: '2wheeler', petrol: 55,   diesel: null,  example: 'e.g. Honda Activa' },
  { label: '🚗 Small Hatchback',      type: '4wheeler', petrol: 23,   diesel: 28,    example: 'e.g. Maruti Alto / Swift' },
  { label: '🚗 Compact SUV',          type: '4wheeler', petrol: 17,   diesel: 22,    example: 'e.g. Tata Nexon / Hyundai Venue' },
  { label: '🚙 Mid-size SUV',         type: '4wheeler', petrol: 14,   diesel: 17,    example: 'e.g. Hyundai Creta / Kia Seltos' },
  { label: '🚙 Large SUV',            type: '4wheeler', petrol: 11,   diesel: 14,    example: 'e.g. Toyota Fortuner / Mahindra XUV700' },
];
