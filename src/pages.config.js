import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import ContactForm from './pages/ContactForm';
import CorporateLectures from './pages/CorporateLectures';
import Home from './pages/Home';
import NewsletterManager from './pages/NewsletterManager';
import PersonalWorkshops from './pages/PersonalWorkshops';
import Podcast from './pages/Podcast';
import SiteAdmin from './pages/SiteAdmin';
import Testimonials from './pages/Testimonials';
import Unsubscribe from './pages/Unsubscribe';
import WomensDay2026 from './pages/WomensDay2026';
import Workshops from './pages/Workshops';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Blog": Blog,
    "Contact": Contact,
    "ContactForm": ContactForm,
    "CorporateLectures": CorporateLectures,
    "Home": Home,
    "NewsletterManager": NewsletterManager,
    "PersonalWorkshops": PersonalWorkshops,
    "Podcast": Podcast,
    "SiteAdmin": SiteAdmin,
    "Testimonials": Testimonials,
    "Unsubscribe": Unsubscribe,
    "WomensDay2026": WomensDay2026,
    "Workshops": Workshops,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};