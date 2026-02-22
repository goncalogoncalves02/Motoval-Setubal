import { Car, Bike, Gauge, CircleDot, Wrench, ShoppingCart } from 'lucide-react';
import { WhatsappIcon } from '../components/icons/WhatsappIcon';

export const hero = {
  headline: "Especialistas em Pneus para Carros e Motos",
  subheadline: "Atendimento 5 estrelas aos melhores preços em Palmela. Confie em quem entende do assunto.",
  ctaPrimary: {
    text: "📞 Ligar Agora",
    phone: "934803632"
  },
  ctaSecondary: {
    text: "Falar no WhatsApp",
    link: "https://wa.me/351934803632"
  },
  stats: [
    { value: "4.9★", label: "300+ Reviews" },
    { value: "3.000+", label: "Clientes Satisfeitos" }
  ]
};

export const services = {
  title: "Os Nossos Serviços",
  subtitle: "Soluções completas para o seu veículo, com qualidade e preços justos",
  items: [
    {
      id: 1,
      icon: Car,
      title: "Montagem de Pneus - Carros",
      description: "Jantes de aço, alumínio, 4x4 e runflat",
      price: "Desde 15€"
    },
    {
      id: 2,
      icon: Bike,
      title: "Montagem de Pneus - Motos",
      description: "Todas as cilindradas e estilos",
      price: "Desde 25€"
    },
    {
      id: 3,
      icon: Gauge,
      title: "Alinhamento & Paralelismo",
      description: "Controlo completo da geometria",
      price: "Desde 25€"
    },
    {
      id: 4,
      icon: CircleDot,
      title: "Equilibragem & Calibragem",
      description: "Rodagem suave e segura",
      price: "Apenas 5€ por roda"
    },
    {
      id: 5,
      icon: Wrench,
      title: "Reparação de Furos",
      description: "Solução rápida e duradoura",
      price: "Desde 10€"
    },
    {
      id: 6,
      icon: ShoppingCart,
      title: "Venda de Pneus",
      description: "Todas as marcas | Stock permanente",
      price: "Sob orçamento"
    }
  ]
};

export const about = {
  title: "Conheça a Motoval Setúbal",
  text: "Somos uma oficina especializada em montagem e comércio de pneus para carros e motos, localizada em Aires, Palmela. Sob a liderança do Bruno Gonçalves, a nossa missão é oferecer um serviço de excelência, com atendimento personalizado e preços competitivos. Com anos de experiência no setor, já ajudámos milhares de clientes a manterem os seus veículos seguros e em perfeitas condições.",
  stats: [
    { value: "10+", label: "Anos de Experiência" },
    { value: "3.000+", label: "Clientes Satisfeitos" },
    { value: "4.9★", label: "Avaliação Média" },
    { value: "100%", label: "Recomendações" }
  ]
};

export const testimonials = {
  title: "O Que Dizem os Nossos Clientes",
  subtitle: "A satisfação dos nossos clientes é o nosso melhor cartão de visita",
  items: [
    {
      id: 1,
      text: "A Motoval é um daqueles locais que demonstra bem como o comércio tradicional tem todos os argumentos para ser uma opção de primeira linha. A simpatia e disponibilidade do Bruno só rivaliza com a perícia e conhecimento do seu trabalho.",
      author: "Pedro E.",
      rating: 5
    },
    {
      id: 2,
      text: "Totalmente satisfeito com os serviços realizados (mudança de pneus de carro e mota). O Sr. Bruno é um excelente profissional, tentando sempre solucionar as urgências.",
      author: "Luís O.",
      rating: 5
    },
    {
      id: 3,
      text: "Hoje em vésperas de ano novo e com a oficina em limpezas ainda anuiu em auxiliar e montar um pneu da minha mota. Trabalho impecável. Precisamos de mais pessoas como o Sr. Bruno.",
      author: "Nelson T.",
      rating: 5
    }
  ]
};

export const schedule = {
  title: "Horário de Funcionamento",
  subtitle: "Estamos aqui para o ajudar. Recomendamos marcação, especialmente aos sábados.",
  hours: [
    { day: "Segunda", hours: "10:00-13:30 | 15:00-19:30" },
    { day: "Terça", hours: "10:00-13:30 | 15:00-19:30" },
    { day: "Quarta", hours: "10:00-13:30 | 15:00-19:30" },
    { day: "Quinta", hours: "10:00-13:30 | 15:00-19:30" },
    { day: "Sexta", hours: "10:00-13:30 | 15:00-19:30" },
    { day: "Sábado", hours: "10:00-13:30" },
    { day: "Domingo", hours: "Fechado" }
  ],
  note: "Recomendamos marcação, especialmente aos sábados. Atendemos urgências conforme disponibilidade."
};

export const contact = {
  title: "Contacte-nos",
  subtitle: "Estamos disponíveis para o ajudar. Escolha a forma mais conveniente.",
  items: [
    {
      id: "phone",
      icon: "Phone",
      label: "Ligar Agora",
      value: "934 803 632",
      href: "tel:934803632"
    },
    {
      id: "whatsapp",
      icon: "WhatsappIcon",
      label: "WhatsApp",
      value: "Enviar mensagem",
      href: "https://wa.me/351934803632"
    },
    {
      id: "email",
      icon: "Mail",
      label: "Email",
      value: "motoval.setubal@gmail.com",
      href: "mailto:motoval.setubal@gmail.com"
    },
    {
      id: "address",
      icon: "MapPin",
      label: "Morada",
      value: "Quinta das Asseadas, Lote 1 (EN 252), 2950-019 Palmela",
      href: "https://maps.app.goo.gl/cSbE86MjY4KjA8RJA"
    }
  ],
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5183.367286587057!2d-8.890975922671554!3d38.56212067179768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd194323971d5b77%3A0xa45ef3600ad7f4d2!2sMotoval%20Set%C3%BAbal!5e1!3m2!1spt-PT!2spt!4v1769799190389!5m2!1spt-PT!2spt"
};

export const faq = {
  title: "Perguntas Frequentes",
  items: [
    {
      id: 1,
      question: "Preciso de marcação?",
      answer: "Recomendada, especialmente aos sábados. Atendemos urgências conforme disponibilidade."
    },
    {
      id: 2,
      question: "Fazem montagem de pneus de moto?",
      answer: "Sim, todos os tipos desde 25€. Trabalhamos com todas as cilindradas e estilos de motos."
    },
    {
      id: 3,
      question: "Quanto custa o alinhamento?",
      answer: "Dianteiro 25€, dianteiro+traseiro 30€. Controlo completo da geometria do veículo."
    },
    {
      id: 4,
      question: "Aceitam cartão?",
      answer: "Sim, crédito, débito e pagamentos NFC. Para sua comodidade aceitamos várias formas de pagamento."
    },
    {
      id: 5,
      question: "Têm pneus em stock?",
      answer: "Sim, grande diversidade. Referências especiais em 2-3 dias."
    }
  ]
};

export const footer = {
  description: "Especialistas em pneus para carros e motos em Palmela. Atendimento 5 estrelas aos melhores preços.",
  quickLinks: [
    { label: "Início", href: "#hero" },
    { label: "Serviços", href: "#services" },
    { label: "Sobre", href: "#about" },
    { label: "Contactos", href: "#contact" }
  ],
  copyright: "© 2026 Motoval Setúbal. Todos os direitos reservados."
};

export const nav = {
  logo: "Motoval Setúbal",
  links: [
    { label: "Início", href: "#hero" },
    { label: "Serviços", href: "#services" },
    { label: "Sobre", href: "#about" },
    { label: "Contactos", href: "#contact" }
  ],
  cta: {
    label: "Contactar",
    href: "#contact"
  }
};

export const ofertasTeaser = {
  badge: "Pneus Novos e Usados",
  title: "Ofertas Especiais",
  subtitle: "Pneus a preços acessíveis — carros e motos. Stock limitado, atualizado regularmente.",
  cta: "Ver Todas as Ofertas",
  href: "/ofertas"
};
