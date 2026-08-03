import { AdventureConfig } from '../core/models/adventure.models';

const demoVideo = 'https://res.cloudinary.com/demo/video/upload/dog.mp4'; // TODO: reemplazar por cada video personal.
const demoPoster = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=75'; // TODO

export const ADVENTURE_CONFIG: AdventureConfig = {
  version: 2,
  recipientName: 'Kathia',
  experienceName: 'Nuestra aventura',
  eventDate: '2026-12-31', // TODO: fecha real del cumpleaños.
  introText: 'Kathia, hoy no recibirás solamente un regalo.\n\nDurante las próximas horas tendrás que encontrar seis fragmentos. Algunos estarán cerca. Otros requerirán que observes, recuerdes y confíes.\n\nGuárdalos todos. Al final entenderás para qué sirven.',
  introVideoUrl: '/videos/feliz-cumpleanos-kathia.mp4', // Copia tu video con este nombre dentro de public/videos/.
  introVideoPosterUrl: demoPoster, // TODO: reemplazar por una portada del video introductorio.
  coverImageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1400&q=80', // TODO
  musicUrl: '', // TODO: URL HTTPS de una pista ambiental con licencia.
  adminKey: 'cambiar-esta-clave-2026', // TODO: cambia esta clave antes de publicar.
  fragmentMode: 'abstract',
  stages: [
    {
      id: 'rosa-7f3a', order: 1, kind: 'intro', title: 'El comienzo', subtitle: 'La primera señal',
      description: 'Toda historia necesita una primera señal. En el primer piso hay algo que suele representar amor, pero hoy guarda un secreto.',
      mission: 'Encuentra la rosa escondida en el primer piso y descubre el código que guarda.',
      primaryHint: 'Está cerca, en un lugar por el que pasas todos los días.', secondaryHint: 'Busca en el primer piso algo que no suele estar ahí.', finalHint: 'Busca una rosa: el código está escondido junto a ella.',
      expectedQrCode: 'NA-7F3A-ROSA-9Q2K', manualCode: 'ROSA-1704', validationMode: 'code-only', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'La primera señal tenía algo que quería decirte.',
      afterVideoText: 'Elegí una flor porque algunas cosas bonitas duran poco, pero el recuerdo de recibirlas puede durar para siempre.',
      completionMessage: 'Elegí una flor porque algunas cosas bonitas duran poco, pero el recuerdo de recibirlas puede durar para siempre.',
      nextTeaser: 'Alguien guarda unas palabras para ti.',
      reward: { id: 'fragmento-1', name: 'Primer fragmento', icon: '◒', description: 'La primera parte de una imagen que todavía no puedes ver.' },
      fragment: { id: 'fragmento-1', label: 'I', color: '#b86f7f' }, // TODO: añadir imageUrl del fragmento definitivo.
      rewardInstruction: 'Guarda también el fragmento físico que acompaña a la rosa.', nextStageName: 'Un antojo pendiente',
      interaction: { kind: 'discovery' },
    },
    {
      id: 'palabras-2b8m', order: 2, kind: 'stop', title: 'Un antojo pendiente', subtitle: 'Una pista por ordenar',
      description: 'Hay algo que llevas tiempo queriendo probar. Las palabras guardan el próximo destino.',
      mission: 'Hay algo que llevas tiempo queriendo probar. Ordena las palabras para descubrir tu próximo destino.',
      primaryHint: 'Piensa en ese antojo que has mencionado más de una vez.', secondaryHint: 'Es algo fresco, colorido y perfecto para una pausa.', finalHint: 'El orden correcto comienza con “Es hora de…”.',
      mapUrl: 'https://maps.app.goo.gl/FvPdSck8bXbLr3LY9', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=75',
      expectedQrCode: 'NA-2B8M-PALABRAS-4X9P', manualCode: 'CONTIGO-8241', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'Llegaste al lugar que escondían las palabras.', afterVideoText: 'Contigo, incluso un antojo pendiente puede convertirse en un recuerdo especial.',
      completionMessage: 'Hay palabras que se sienten más verdaderas cuando llevan un poco de nosotros.', nextTeaser: 'La siguiente parte no habla de un lugar, sino de ti.',
      reward: { id: 'fragmento-2', name: 'Segundo fragmento', icon: '◐', description: 'Otra forma empieza a aparecer.' },
      fragment: { id: 'fragmento-2', label: 'II', color: '#d29a83' }, rewardInstruction: 'Guarda la carta y el fragmento físico del sobre.', nextStageName: 'Lo que veo en ti',
      interaction: {
        kind: 'word-order',
        phrase: 'Es hora de probar el açaí que tanto querías.',
        phraseParts: ['Es hora de probar', 'el açaí', 'que tanto querías.'],
        successMessage: 'Es hora de probar el açaí que tanto querías.',
        destinationName: 'Açaí Brasil',
        arrivalInstruction: 'Al llegar, acércate al mesón y pregunta por el sobre reservado a nombre de Kathia.',
        locationAlt: 'Açaí Brasil, destino donde está reservado el sobre para Kathia.',
      },
    },
    {
      id: 'cualidades-5k1r', order: 3, kind: 'stop', title: 'Lo que veo en ti', subtitle: 'Hay cosas que quizá no notas',
      description: 'Quizás tú haces estas cosas sin darte cuenta. Yo sí me doy cuenta.',
      mission: 'Recorre tres pequeños recuerdos y descubre qué cualidad tuya veo en cada uno.',
      primaryHint: 'No es una prueba: elige lo que cada recuerdo te haga sentir.', secondaryHint: 'Las tres palabras son empatía, fortaleza y ternura.', finalHint: 'Cada palabra se usa una vez; puedes cambiar tus elecciones.',
      expectedQrCode: 'NA-5K1R-CUALIDADES-8V6D', manualCode: 'MIRADA-5930', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'Esto es apenas una parte de cómo te veo.', afterVideoText: 'Tu forma de cuidar, sostener y querer hace más bonito todo lo que te rodea.',
      completionMessage: 'Quizás tú haces estas cosas sin darte cuenta. Yo sí me doy cuenta.', nextTeaser: 'Un recuerdo incompleto señalará el próximo lugar.',
      reward: { id: 'fragmento-3', name: 'Tercer fragmento', icon: '◓', description: 'La composición guarda ya la mitad de su secreto.' },
      fragment: { id: 'fragmento-3', label: 'III', color: '#8f6678' }, rewardInstruction: 'Conserva la tarjeta y el tercer fragmento.', nextStageName: 'Una imagen incompleta',
      interaction: { kind: 'qualities', qualities: ['Empatía', 'Fortaleza', 'Ternura'], scenarios: [
        { text: 'Cuando escuchaste sin apurarme y lograste que me sintiera comprendido.', quality: 'Empatía' },
        { text: 'Cuando seguiste adelante incluso en uno de tus días más difíciles.', quality: 'Fortaleza' },
        { text: 'Cuando un gesto pequeño tuyo hizo que todo se sintiera como hogar.', quality: 'Ternura' },
      ] },
    },
    {
      id: 'imagen-8n4c', order: 4, kind: 'stop', title: 'Una imagen incompleta', subtitle: 'Un lugar entre nosotros',
      description: 'Hay lugares que una fotografía apenas alcanza a guardar. Esta imagen oculta uno de ellos.',
      mission: 'Revela la fotografía poco a poco, descubre el lugar y encuentra allí el cuarto fragmento.',
      primaryHint: 'Observa los colores y las formas antes de intentar reconocer el lugar.', secondaryHint: 'Es un sitio que forma parte de uno de nuestros recuerdos.', finalHint: 'La ubicación exacta está disponible debajo de la imagen.',
      mapUrl: 'https://maps.google.com/', imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=75',
      expectedQrCode: 'NA-8N4C-IMAGEN-1W7H', manualCode: 'LUGAR-6412', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'Llegaste al lugar que guardaba esta imagen.', afterVideoText: 'No necesitamos haber conocido cien lugares. Me basta con saber que quiero conocer los próximos contigo.',
      completionMessage: 'No necesitamos haber conocido cien lugares. Me basta con saber que quiero conocer los próximos contigo.', nextTeaser: 'Ya tienes suficientes piezas para intentar ver lo que forman.',
      reward: { id: 'fragmento-4', name: 'Cuarto fragmento', icon: '◑', description: 'Los bordes empiezan a encontrarse.' },
      fragment: { id: 'fragmento-4', label: 'IV', color: '#c7a269' }, rewardInstruction: 'Guarda la fotografía impresa, la dedicatoria y el fragmento.', nextStageName: 'Todo empieza a encajar',
      interaction: { kind: 'photo-reveal', locationAlt: 'Lugar especial configurado en Google Maps; si el mapa no abre, usa la pista final.' },
    },
    {
      id: 'encajar-3p9t', order: 5, kind: 'assembly', title: 'Todo empieza a encajar', subtitle: 'Casi puedes verlo',
      description: 'Has encontrado casi todo. Pero la última pieza nunca salió de donde comenzó esta aventura.',
      mission: 'Ordena los fragmentos digitales y observa el espacio que todavía permanece vacío.',
      primaryHint: 'Cada fragmento tiene un lugar natural en la secuencia.', secondaryHint: 'Ordénalos según el momento en que llegaron a tus manos.', finalHint: 'El primero va arriba a la izquierda; continúa en orden hasta el cuarto.',
      expectedQrCode: 'NA-3P9T-ENCAJAR-6Y2J', manualCode: 'ENCAJAR-3187', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'Casi todas las piezas están reunidas.', afterVideoText: 'A veces, para entender una historia, solo hace falta mirar cómo se unen sus partes.',
      completionMessage: 'Has encontrado casi todo. La pieza central todavía está esperando.', nextTeaser: 'La última señal conoce el lugar donde todo comenzó.',
      reward: { id: 'fragmento-5', name: 'Quinto fragmento', icon: '◔', description: 'Solo queda un vacío en el centro.' },
      fragment: { id: 'fragmento-5', label: 'V', color: '#794656' }, rewardInstruction: 'No pierdas de vista la pieza central que aún falta.', nextStageName: 'De regreso a casa',
      interaction: { kind: 'fragment-order' }, countdownTarget: '',
    },
    {
      id: 'regreso-6z2q', order: 6, kind: 'homecoming', title: 'De regreso a casa', subtitle: 'La última pieza',
      description: 'La última señal guarda el giro que faltaba. Encuéntrala antes de descubrir hacia dónde apunta.',
      mission: 'Valida el último código externo y completa la composición de seis fragmentos.',
      primaryHint: 'La señal está vinculada al lugar donde empezó todo.', secondaryHint: 'Piensa en la primera flor y en el lugar donde la encontraste.', finalHint: 'Escanea el código final externo; después sabrás exactamente qué hacer.',
      expectedQrCode: 'NA-6Z2Q-REGRESO-5M8S', manualCode: 'REGRESAR-9026', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'La sexta pieza completa algo más que una imagen.', afterVideoText: 'Lo que buscas te espera en casa.',
      completionMessage: 'Lo que buscas te espera en casa.', nextTeaser: 'Regresa al lugar donde encontraste la primera flor. La última parte de esta historia ya te está esperando.',
      reward: { id: 'fragmento-6', name: 'Sexto fragmento', icon: '●', description: 'La composición está completa, pero aún guarda una última puerta.' },
      fragment: { id: 'fragmento-6', label: 'VI', color: '#dab77d' }, rewardInstruction: 'Reúne los seis fragmentos físicos y llévalos contigo.',
      specialInstruction: 'Regresa al lugar donde encontraste la primera flor. Busca el QR dentro de la habitación decorada.',
      interaction: { kind: 'homecoming', approximateReturnMinutes: 20 },
    },
  ],
  epilogue: {
    expectedQrCode: 'NA-EPILOGO-HABITACION-2026', manualCode: 'Kathia-EPILOGO', videoUrl: demoVideo, videoPosterUrl: demoPoster,
    galleryUrls: [], // TODO: añadir fotografías finales.
    introText: 'Encontraste seis fragmentos, pero desde el comienzo todos hablaban de una sola persona: tú.',
    finalGiftName: 'Brazalete Pandora', finalGiftImageUrl: '', // TODO: fotografía del regalo.
    finalLetter: 'Quise mezclar mi mundo con el tuyo. Yo construí la página, los códigos y cada detalle técnico. Pero todo eso solamente tenía sentido porque la historia era sobre ti. Feliz cumpleaños, Kathia.',
  },
};
