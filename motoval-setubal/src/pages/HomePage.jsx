import Seo from '../components/Seo';
import Hero from '../components/Hero';
import OfertasTeaser from '../components/OfertasTeaser';
import Services from '../components/Services';
import About from '../components/About';
import Testimonials from '../components/Testimonials';

const HomePage = () => {
  return (
    <>
      <Seo
        title="Motoval Setúbal | Especialistas em Pneus para Carros e Motos em Palmela"
        description="Montagem de pneus para carros e motos em Palmela, Aires. Atendimento 5 estrelas com 4.9★. Alinhamento desde 25€, equilibragem 5€, reparação de furos. Ligue 934 803 632."
        path="/"
      />
      <Hero />
      <OfertasTeaser />
      <Services />
      <About />
      <Testimonials />
    </>
  );
};

export default HomePage;
