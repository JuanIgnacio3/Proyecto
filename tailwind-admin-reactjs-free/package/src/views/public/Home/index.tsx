import Hero from './sections/Hero';
import Historia from './sections/Historia';
import Especialidades from './sections/Especialidades';
import VidaEstudiantil from './sections/VidaEstudiantil';
import Noticias from './sections/Noticias';
import Admision from './sections/Admision';
import Contacto from './sections/Contacto';

/**
 * Pagina de inicio del sitio publico. Es una composicion de secciones
 * independientes. Nuevas secciones (Especialidades, Vida estudiantil, ...) se
 * agregan aqui sin crecer un unico componente.
 */
const Home = () => (
  <>
    <Hero />
    <Historia />
    <Especialidades />
    <VidaEstudiantil />
    <Noticias />
    <Admision />
    <Contacto />
  </>
);

export default Home;
