import { AdventureConfig } from '../core/models/adventure.models';

const demoVideo = 'https://res.cloudinary.com/demo/video/upload/dog.mp4'; // TODO: reemplazar por cada video personal.
const demoPoster = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=75'; // TODO

export const ADVENTURE_CONFIG: AdventureConfig = {
  version: 2,
  recipientName: 'Kathia',
  experienceName: 'El universo de Kathia',
  eventDate: '2026-08-08',
  introText: 'Kathia bebe , hoy no recibirás solamente un regalo.\n\nDurante el proximo ratito tendrás que encontrar seis fragmentos de historia. Algunos estarán cerca. Otros requerirán que observes, recuerdes y confíes.\n\nGuárdalos todos. Al final entenderás para qué sirven.',
  introVideoUrl: '/videos/feliz-cumpleanos-kathia.mp4', // Copia tu video con este nombre dentro de public/videos/.
  introVideoPosterUrl: demoPoster, // TODO: reemplazar por una portada del video introductorio.
  coverImageUrl: '/images/bienvenida.png',
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
      fragment: { id: 'fragmento-2', label: 'M', color: '#d29a83' }, rewardInstruction: 'Guarda la carta y el fragmento físico del sobre.', nextStageName: 'Lo que veo en ti',
      interaction: {
        kind: 'word-order',
        phrase: 'Es hora de probar el açaí que tanto querías.',
        phraseParts: ['Es hora de probar', 'el açaí', 'que tanto querías.'],
        successMessage: 'Es hora de probar el açaí que tanto querías.',
        destinationName: 'Açaí Brasil',
        arrivalInstruction: 'Al llegar, acércate al mesón y pregunta por si hay algo reservado a nombre de Kathia.',
        locationAlt: 'Açaí Brasil, destino donde está reservado el sobre para Kathia.',
      },
    },
    {
      id: 'cualidades-5k1r', order: 3, kind: 'stop', title: 'Algo te está esperando', subtitle: 'Un destino entre muchas tiendas',
      description: 'La tercera señal no está escondida en casa. Tendrás que salir y descubrir el lugar exacto donde algo te espera.',
      mission: 'Sigue las pistas hasta descubrir tu próximo destino. Cuando creas haberlo encontrado, ve hasta allí y busca la señal que preparé para ti.',
      primaryHint: 'Ve al lugar donde muchas tiendas comparten un mismo techo. Allí busca aquello que acompaña tus pasos, carga tus cosas y guarda lo necesario para una aventura. El nombre que buscas tiene cinco letras: tres repiten la misma consonante y la última es una A.',
      secondaryHint: 'Puedes llevar sus productos en la mano, sobre el hombro o contigo durante un viaje.',
      finalHint: 'Ve al mall y busca la tienda Bubba. Pregunta por una bolsa reservada a nombre de Kathia. Cuando te la entreguen, no la abras: escanea el QR pegado en ella.',
      expectedQrCode: 'NA-5K1R-CUALIDADES-8V6D', manualCode: 'MIRADA-5930', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'La bolsa guardaba algo más que una sorpresa.', afterVideoText: 'A veces una aventura comienza mucho antes de abrir un regalo.',
      completionMessage: 'Llegaste hasta la bolsa y encontraste la señal que escondía.', nextTeaser: 'Un recuerdo incompleto señalará el próximo lugar.',
      reward: { id: 'fragmento-3', name: 'Tercer fragmento', icon: '◓', description: 'La composición guarda ya la mitad de su secreto.' },
      fragment: { id: 'fragmento-3', label: 'V', color: '#8f6678' }, rewardInstruction: 'Guarda la bolsa y el tercer fragmento. Todavía forman parte de la aventura.', nextStageName: 'Antes del primer bocado',
      interaction: { kind: 'discovery' },
    },
    {
      id: 'imagen-8n4c', order: 4, kind: 'stop', title: 'Antes del primer bocado', subtitle: 'Un antojo con una señal',
      description: 'La siguiente parte se esconde en un sabor que ya conoces y en un lugar al que tus antojos siempre saben volver.',
      mission: 'Descubre qué debes retirar y dónde te espera. Cuando lo recibas, observa todo con calma antes de probarlo.',
      primaryHint: 'La próxima señal tiene una base firme y un corazón suave. Te espera en ese lugar que tus antojos elegirían sin pensarlo dos veces. Ve a tu rincón favorito y pregunta si dejaron algo reservado a tu nombre. Antes del primer bocado, observa muy bien lo que recibas.',
      secondaryHint: 'Es frío, cremoso y cada porción comienza con una base crujiente.',
      finalHint: 'Retira el cheesecake reservado a nombre de Kathia. Antes de probarlo, busca la señal que lleva por fuera.',
      expectedQrCode: 'NA-8N4C-CHEESECAKE-1W7H', manualCode: 'DULCE-6412', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'El antojo guardaba algo más que un momento dulce.', afterVideoText: 'Hay lugares favoritos que se vuelven todavía más especiales cuando guardan una sorpresa.',
      completionMessage: 'Encontraste la señal antes del primer bocado.', nextTeaser: 'Ya tienes suficientes piezas para intentar ver lo que forman.',
      reward: { id: 'fragmento-4', name: 'Cuarto fragmento', icon: '◑', description: 'Los bordes empiezan a encontrarse.' },
      fragment: { id: 'fragmento-4', label: 'I', color: '#c7a269' }, rewardInstruction: 'Guarda el cuarto fragmento y disfruta el cheesecake después de seguir la señal.', nextStageName: 'Todo empieza a encajar',
      interaction: { kind: 'discovery' },
    },
    {
      id: 'encajar-3p9t', order: 5, kind: 'stop', title: 'Más cerca de lo que crees', subtitle: 'No tienes que ir más lejos',
      description: 'Ya recorriste bastante por hoy.',
      mission: 'Fuiste de un lugar a otro siguiendo mis pistas, buscando cosas que preparé para ti. Pero esta vez no tienes que ir a ningún lugar nuevo. De hecho, lo que buscas ha estado mucho más cerca de ti de lo que imaginas.',
      primaryHint: 'No está en una tienda. Tampoco lo dejé escondido en algún lugar de Arica.',
      secondaryHint: 'Estuvo contigo cuando encontraste la rosa. Estuvo contigo cuando fuiste por tu açaí. Y también cuando llegaste hasta Bubba.',
      tertiaryHint: 'Ha recorrido contigo cada lugar de esta aventura.',
      finalHint: 'Piensa en lo que te ha llevado de un destino a otro durante todo el día.',
      expectedQrCode: 'NA-3P9T-AUTO-6Y2J', manualCode: 'AUTO-3187', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'La señal estuvo cerca de ti desde antes de que comenzara todo.', afterVideoText: 'A veces buscamos muy lejos aquello que nos acompañó desde el principio.',
      completionMessage: 'Encontraste el sobre que llevaba horas viajando contigo.', nextTeaser: 'La última señal conoce el lugar donde todo comenzó.',
      reward: { id: 'fragmento-5', name: 'Quinto fragmento', icon: '◔', description: 'Solo queda un vacío en el centro.' },
      fragment: { id: 'fragmento-5', label: 'D', color: '#794656' }, rewardInstruction: 'Guarda el sobre y el quinto fragmento. Solo falta una pieza.', nextStageName: 'De regreso a casa',
      interaction: { kind: 'discovery', destinationName: 'Vuelve al auto', arrivalInstruction: 'Hay algo ahí que lleva horas esperando que lo encuentres.' },
    },
    {
      id: 'regreso-6z2q', order: 6, kind: 'homecoming', title: 'Llegaste hasta aquí', subtitle: 'Lo que siempre estuvo detrás de todo',
      description: 'Durante todo el día fuiste guardando pequeñas piezas sin saber realmente para qué servían.',
      mission: 'Ya no necesitas buscar otra pista. Ahora necesito que saques todos tus fragmentos y los pongas juntos.',
      primaryHint: '', secondaryHint: '', finalHint: '',
      expectedQrCode: 'NA-6Z2Q-REGRESO-5M8S', manualCode: 'REGRESAR-9026', videoUrl: demoVideo, videoPosterUrl: demoPoster,
      beforeVideoText: 'Las seis piezas siempre estuvieron diciendo lo mismo.', afterVideoText: 'Lo que buscas te espera en casa.',
      completionMessage: 'Descubriste lo que llevabas contigo durante toda esta aventura.', nextTeaser: 'Ya no queda nada más que buscar afuera.',
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
