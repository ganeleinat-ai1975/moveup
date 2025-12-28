import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch existing SiteSettings
        const siteSettingsList = await base44.entities.SiteSettings.list();
        if (!siteSettingsList || siteSettingsList.length === 0) {
            return Response.json({ message: 'No SiteSettings found to migrate' });
        }
        const s = siteSettingsList[0]; // The single record

        // 2. Prepare data for new entities
        
        // GlobalSettings
        const globalData = {
            site_title_he: s.site_title_he, site_title_en: s.site_title_en,
            tagline_he: s.tagline_he, tagline_en: s.tagline_en,
            logo_url_he: s.logo_url_he, logo_url_en: s.logo_url_en,
            footer_logo_url_he: s.footer_logo_url_he, footer_logo_url_en: s.footer_logo_url_en,
            primary_color: s.primary_color, secondary_color: s.secondary_color,
            accent_color: s.accent_color, text_color: s.text_color, background_color: s.background_color,
            header_admin_menu_color: s.header_admin_menu_color,
            font_family_he: s.font_family_he, font_family_en: s.font_family_en,
            font_size_base: s.font_size_base, font_weight_bold: s.font_weight_bold,
            newsletter_groups: s.newsletter_groups,
            // Nav
            nav_home_he: s.nav_home_he, nav_home_en: s.nav_home_en,
            nav_about_he: s.nav_about_he, nav_about_en: s.nav_about_en,
            nav_personal_he: s.nav_personal_he, nav_personal_en: s.nav_personal_en,
            nav_corporate_he: s.nav_corporate_he, nav_corporate_en: s.nav_corporate_en,
            nav_testimonials_he: s.nav_testimonials_he, nav_testimonials_en: s.nav_testimonials_en,
            nav_podcast_he: s.nav_podcast_he, nav_podcast_en: s.nav_podcast_en,
            nav_blog_he: s.nav_blog_he, nav_blog_en: s.nav_blog_en,
            nav_contact_he: s.nav_contact_he, nav_contact_en: s.nav_contact_en,
            // Contact Info
            contact_phone: s.contact_phone, contact_email: s.contact_email, contact_whatsapp: s.contact_whatsapp,
            // Social
            instagram_url: s.instagram_url, linkedin_url: s.linkedin_url,
            facebook_url: s.facebook_url, youtube_url: s.youtube_url,
            // Footer
            footer_background_color: s.footer_background_color,
            footer_text_color: s.footer_text_color, footer_title_color: s.footer_title_color,
            footer_nav_title_he: s.footer_nav_title_he, footer_nav_title_en: s.footer_nav_title_en,
            footer_contact_title_he: s.footer_contact_title_he, footer_contact_title_en: s.footer_contact_title_en,
            footer_social_title_he: s.footer_social_title_he, footer_social_title_en: s.footer_social_title_en,
            footer_copyright_he: s.footer_copyright_he, footer_copyright_en: s.footer_copyright_en,
            footer_bot_link_enabled: s.footer_bot_link_enabled,
            footer_bot_link_text_he: s.footer_bot_link_text_he, footer_bot_link_text_en: s.footer_bot_link_text_en,
            footer_bot_link_url: s.footer_bot_link_url,
            // General Labels
            general_loading_he: s.general_loading_he, general_loading_en: s.general_loading_en,
            general_coming_soon_he: s.general_coming_soon_he, general_coming_soon_en: s.general_coming_soon_en,
            general_stay_updated_he: s.general_stay_updated_he, general_stay_updated_en: s.general_stay_updated_en,
            general_read_more_he: s.general_read_more_he, general_read_more_en: s.general_read_more_en,
            general_watch_video_he: s.general_watch_video_he, general_watch_video_en: s.general_watch_video_en,
            general_workshop_he: s.general_workshop_he, general_workshop_en: s.general_workshop_en,
            general_consulting_he: s.general_consulting_he, general_consulting_en: s.general_consulting_en,
            general_lecture_he: s.general_lecture_he, general_lecture_en: s.general_lecture_en,
            general_participants_he: s.general_participants_he, general_participants_en: s.general_participants_en,
            general_register_he: s.general_register_he, general_register_en: s.general_register_en,
            general_phone_he: s.general_phone_he, general_phone_en: s.general_phone_en,
            general_email_he: s.general_email_he, general_email_en: s.general_email_en,
            general_send_message_he: s.general_send_message_he, general_send_message_en: s.general_send_message_en,
            general_episode_he: s.general_episode_he, general_episode_en: s.general_episode_en,
            // Logo Carousel
            logo_carousel_title_he: s.logo_carousel_title_he, logo_carousel_title_en: s.logo_carousel_title_en,
            logo_carousel_bg_color: s.logo_carousel_bg_color,
            logo_carousel_controls_enabled: s.logo_carousel_controls_enabled,
            logo_carousel_animation: s.logo_carousel_animation,
            media_logo_carousel_logos: s.page_media?.logo_carousel_logos || []
        };

        // HomePageSettings
        const homeData = {
            top_cta_title_he: s.top_cta_title_he, top_cta_title_en: s.top_cta_title_en,
            top_cta_subtitle_he: s.top_cta_subtitle_he, top_cta_subtitle_en: s.top_cta_subtitle_en,
            top_cta_button_he: s.top_cta_button_he, top_cta_button_en: s.top_cta_button_en,
            top_cta_bg_color: s.top_cta_bg_color,
            hero_title_he: s.hero_title_he, hero_title_en: s.hero_title_en,
            hero_subtitle_he: s.hero_subtitle_he, hero_subtitle_en: s.hero_subtitle_en,
            hero_subtitle_color: s.hero_subtitle_color,
            hero_cta_primary_he: s.hero_cta_primary_he, hero_cta_primary_en: s.hero_cta_primary_en,
            hero_cta_secondary_he: s.hero_cta_secondary_he, hero_cta_secondary_en: s.hero_cta_secondary_en,
            features_title_he: s.features_title_he, features_title_en: s.features_title_en,
            features_subtitle_he: s.features_subtitle_he, features_subtitle_en: s.features_subtitle_en,
            // Features 1-4
            feature_1_icon: s.feature_1_icon, feature_1_title_he: s.feature_1_title_he, feature_1_title_en: s.feature_1_title_en,
            feature_1_desc_he: s.feature_1_desc_he, feature_1_desc_en: s.feature_1_desc_en,
            feature_1_button_text_he: s.feature_1_button_text_he, feature_1_button_text_en: s.feature_1_button_text_en, feature_1_button_link: s.feature_1_button_link,
            feature_2_icon: s.feature_2_icon, feature_2_title_he: s.feature_2_title_he, feature_2_title_en: s.feature_2_title_en,
            feature_2_desc_he: s.feature_2_desc_he, feature_2_desc_en: s.feature_2_desc_en,
            feature_2_button_text_he: s.feature_2_button_text_he, feature_2_button_text_en: s.feature_2_button_text_en, feature_2_button_link: s.feature_2_button_link,
            feature_3_icon: s.feature_3_icon, feature_3_title_he: s.feature_3_title_he, feature_3_title_en: s.feature_3_title_en,
            feature_3_desc_he: s.feature_3_desc_he, feature_3_desc_en: s.feature_3_desc_en,
            feature_3_button_text_he: s.feature_3_button_text_he, feature_3_button_text_en: s.feature_3_button_text_en, feature_3_button_link: s.feature_3_button_link,
            feature_4_enabled: s.feature_4_enabled, feature_4_icon: s.feature_4_icon,
            feature_4_title_he: s.feature_4_title_he, feature_4_title_en: s.feature_4_title_en,
            feature_4_desc_he: s.feature_4_desc_he, feature_4_desc_en: s.feature_4_desc_en,
            feature_4_button_text_he: s.feature_4_button_text_he, feature_4_button_text_en: s.feature_4_button_text_en, feature_4_button_link: s.feature_4_button_link,
            feature_4_bot_image: s.feature_4_bot_image,
            // Carousels
            testimonials_carousel_title_he: s.testimonials_carousel_title_he, testimonials_carousel_title_en: s.testimonials_carousel_title_en,
            testimonials_carousel_subtitle_he: s.testimonials_carousel_subtitle_he, testimonials_carousel_subtitle_en: s.testimonials_carousel_subtitle_en,
            testimonials_carousel_bg_color: s.testimonials_carousel_bg_color, testimonials_carousel_text_color: s.testimonials_carousel_text_color,
            testimonials_carousel_button_text_he: s.testimonials_carousel_button_text_he, testimonials_carousel_button_text_en: s.testimonials_carousel_button_text_en,
            testimonials_carousel_button_bg_color: s.testimonials_carousel_button_bg_color, testimonials_carousel_button_text_color: s.testimonials_carousel_button_text_color,
            workshops_carousel_enabled: s.workshops_carousel_enabled, workshops_carousel_show_personal: s.workshops_carousel_show_personal,
            workshops_carousel_title_he: s.workshops_carousel_title_he, workshops_carousel_title_en: s.workshops_carousel_title_en,
            workshops_carousel_subtitle_he: s.workshops_carousel_subtitle_he, workshops_carousel_subtitle_en: s.workshops_carousel_subtitle_en,
            workshops_carousel_bg_color: s.workshops_carousel_bg_color, workshops_carousel_text_color: s.workshops_carousel_text_color,
            workshops_carousel_card_bg_color: s.workshops_carousel_card_bg_color,
            carousel_items_order: s.carousel_items_order,
            // CTA & Stats
            cta_section_title_he: s.cta_section_title_he, cta_section_title_en: s.cta_section_title_en,
            cta_section_subtitle_he: s.cta_section_subtitle_he, cta_section_subtitle_en: s.cta_section_subtitle_en,
            cta_section_button_he: s.cta_section_button_he, cta_section_button_en: s.cta_section_button_en,
            home_stats_section_bg_color: s.home_stats_section_bg_color, home_stats_section_text_color: s.home_stats_section_text_color,
            stats_section_title_he: s.stats_section_title_he, stats_section_title_en: s.stats_section_title_en,
            stats: s.stats,
            // Media
            media_home: s.page_media?.home || [],
            media_home_features: s.page_media?.home_features || [],
            media_position_home: s.page_media_position?.home,
            media_position_home_features: s.page_media_position?.home_features
        };

        // AboutPageSettings
        const aboutData = {
            about_page_title_he: s.about_page_title_he, about_page_title_en: s.about_page_title_en,
            about_intro_text_he: s.about_intro_text_he, about_intro_text_en: s.about_intro_text_en,
            about_intro_section_bg_color: s.about_intro_section_bg_color, about_intro_text_color: s.about_intro_text_color,
            about_mission_title_he: s.about_mission_title_he, about_mission_title_en: s.about_mission_title_en,
            about_mission_text_he: s.about_mission_text_he, about_mission_text_en: s.about_mission_text_en,
            managers_section_title_he: s.managers_section_title_he, managers_section_title_en: s.managers_section_title_en,
            managers_section_bg_color: s.managers_section_bg_color, managers_section_text_color: s.managers_section_text_color,
            managers_section_title_color: s.managers_section_title_color,
            managers: s.managers,
            media_about: s.page_media?.about || [],
            media_position_about: s.page_media_position?.about
        };

        // PersonalPageSettings
        const personalData = {
            personal_page_title_he: s.personal_page_title_he, personal_page_title_en: s.personal_page_title_en,
            personal_description_he: s.personal_description_he, personal_description_en: s.personal_description_en,
            personal_show_testimonials_button: s.personal_show_testimonials_button,
            personal_testimonials_button_text_he: s.personal_testimonials_button_text_he, personal_testimonials_button_text_en: s.personal_testimonials_button_text_en,
            personal_benefits_title_he: s.personal_benefits_title_he, personal_benefits_title_en: s.personal_benefits_title_en,
            personal_benefit_1_icon: s.personal_benefit_1_icon,
            personal_benefit_1_title_he: s.personal_benefit_1_title_he, personal_benefit_1_title_en: s.personal_benefit_1_title_en,
            personal_benefit_1_desc_he: s.personal_benefit_1_desc_he, personal_benefit_1_desc_en: s.personal_benefit_1_desc_en,
            personal_benefit_2_icon: s.personal_benefit_2_icon,
            personal_benefit_2_title_he: s.personal_benefit_2_title_he, personal_benefit_2_title_en: s.personal_benefit_2_title_en,
            personal_benefit_2_desc_he: s.personal_benefit_2_desc_he, personal_benefit_2_desc_en: s.personal_benefit_2_desc_en,
            personal_benefit_3_icon: s.personal_benefit_3_icon,
            personal_benefit_3_title_he: s.personal_benefit_3_title_he, personal_benefit_3_title_en: s.personal_benefit_3_title_en,
            personal_benefit_3_desc_he: s.personal_benefit_3_desc_he, personal_benefit_3_desc_en: s.personal_benefit_3_desc_en,
            media_personal_workshops: s.page_media?.personal_workshops || [],
            media_position_personal_workshops: s.page_media_position?.personal_workshops
        };

        // CorporatePageSettings
        const corporateData = {
            corporate_pages: s.corporate_pages,
            media_corporate_lectures_women: s.page_media?.corporate_lectures_women || [],
            media_corporate_lectures_leaders: s.page_media?.corporate_lectures_leaders || [],
            media_position_corporate_lectures_women: s.page_media_position?.corporate_lectures_women,
            media_position_corporate_lectures_leaders: s.page_media_position?.corporate_lectures_leaders
        };

        // TestimonialsPageSettings
        const testimonialsData = {
            testimonials_page_title_he: s.testimonials_page_title_he, testimonials_page_title_en: s.testimonials_page_title_en,
            testimonials_description_he: s.testimonials_description_he, testimonials_description_en: s.testimonials_description_en,
            media_testimonials: s.page_media?.testimonials || [],
            media_position_testimonials: s.page_media_position?.testimonials
        };

        // PodcastPageSettings
        const podcastData = {
            podcast_page_title_he: s.podcast_page_title_he, podcast_page_title_en: s.podcast_page_title_en,
            podcast_description_he: s.podcast_description_he, podcast_description_en: s.podcast_description_en,
            podcast_bg_color: s.podcast_bg_color,
            podcast_spotify_url: s.podcast_spotify_url, podcast_apple_url: s.podcast_apple_url,
            podcast_youtube_url: s.podcast_youtube_url, podcast_google_url: s.podcast_google_url,
            media_podcast: s.page_media?.podcast || [],
            media_position_podcast: s.page_media_position?.podcast
        };

        // BlogPageSettings
        const blogData = {
            blog_page_title_he: s.blog_page_title_he, blog_page_title_en: s.blog_page_title_en,
            blog_description_he: s.blog_description_he, blog_description_en: s.blog_description_en,
            media_blog: s.page_media?.blog || [],
            media_position_blog: s.page_media_position?.blog
        };

        // ContactPageSettings
        const contactData = {
            contact_page_title_he: s.contact_page_title_he, contact_page_title_en: s.contact_page_title_en,
            contact_page_subtitle_he: s.contact_page_subtitle_he, contact_page_subtitle_en: s.contact_page_subtitle_en,
            contact_methods_title_he: s.contact_methods_title_he, contact_methods_title_en: s.contact_methods_title_en,
            contact_social_title_he: s.contact_social_title_he, contact_social_title_en: s.contact_social_title_en,
            contact_form_enabled: s.contact_form_enabled,
            contact_form_title_he: s.contact_form_title_he, contact_form_title_en: s.contact_form_title_en,
            contact_form_subtitle_he: s.contact_form_subtitle_he, contact_form_subtitle_en: s.contact_form_subtitle_en,
            contact_form_success_message_he: s.contact_form_success_message_he, contact_form_success_message_en: s.contact_form_success_message_en,
            contact_form_email_recipient: s.contact_form_email_recipient,
            contact_form_honeypot_field: s.contact_form_honeypot_field,
            contact_page_form_cta_title_he: s.contact_page_form_cta_title_he, contact_page_form_cta_title_en: s.contact_page_form_cta_title_en,
            contact_page_form_cta_subtitle_he: s.contact_page_form_cta_subtitle_he, contact_page_form_cta_subtitle_en: s.contact_page_form_cta_subtitle_en,
            contact_page_form_cta_button_he: s.contact_page_form_cta_button_he, contact_page_form_cta_button_en: s.contact_page_form_cta_button_en,
            contact_page_form_cta_bg_color: s.contact_page_form_cta_bg_color,
            contact_page_form_cta_button_bg_color: s.contact_page_form_cta_button_bg_color,
            contact_page_form_cta_button_text_color: s.contact_page_form_cta_button_text_color,
            media_contact: s.page_media?.contact || [],
            media_position_contact: s.page_media_position?.contact
        };

        // 3. Clean up undefined values (optional but good practice)
        const clean = (obj) => {
            Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
            return obj;
        };

        // 4. Create new records (Using service role if needed, but admin user is enough)
        // We check if records exist first to avoid duplicates if run multiple times
        
        const ensureRecord = async (Entity, data) => {
            const existing = await Entity.list();
            if (existing.length === 0) {
                await Entity.create(clean(data));
                return "created";
            } else {
                // Optional: Update existing? For migration, we might want to update.
                // But let's assume empty entities for now.
                // If the user wants to re-run, we should probably update.
                await Entity.update(existing[0].id, clean(data));
                return "updated";
            }
        };

        await ensureRecord(base44.entities.GlobalSettings, globalData);
        await ensureRecord(base44.entities.HomePageSettings, homeData);
        await ensureRecord(base44.entities.AboutPageSettings, aboutData);
        await ensureRecord(base44.entities.PersonalPageSettings, personalData);
        await ensureRecord(base44.entities.CorporatePageSettings, corporateData);
        await ensureRecord(base44.entities.TestimonialsPageSettings, testimonialsData);
        await ensureRecord(base44.entities.PodcastPageSettings, podcastData);
        await ensureRecord(base44.entities.BlogPageSettings, blogData);
        await ensureRecord(base44.entities.ContactPageSettings, contactData);

        return Response.json({ success: true, message: 'Migration completed successfully' });

    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});