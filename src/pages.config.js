import Home from './pages/Home';
import About from './pages/About';
import Workshops from './pages/Workshops';
import Testimonials from './pages/Testimonials';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import SiteAdmin from './pages/SiteAdmin';
import PersonalWorkshops from './pages/PersonalWorkshops';
import CorporateLectures from './pages/CorporateLectures';
import Podcast from './pages/Podcast';
import ContactForm from './pages/ContactForm';
import Unsubscribe from './pages/Unsubscribe';
import NewsletterManager from './pages/NewsletterManager';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "About": About,
    "Workshops": Workshops,
    "Testimonials": Testimonials,
    "Blog": Blog,
    "Contact": Contact,
    "SiteAdmin": SiteAdmin,
    "PersonalWorkshops": PersonalWorkshops,
    "CorporateLectures": CorporateLectures,
    "Podcast": Podcast,
    "ContactForm": ContactForm,
    "Unsubscribe": Unsubscribe,
    "NewsletterManager": NewsletterManager,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};