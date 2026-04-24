import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

export default Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      globalSettings,
      homeSettings,
      aboutSettings,
      personalSettings,
      corporateSettings,
      testimonialsSettings,
      podcastSettings,
      blogSettings,
      contactSettings,
      blogPosts,
      testimonials,
      workshops,
      lectures,
      episodes
    ] = await Promise.all([
      base44.entities.GlobalSettings.list().then(res => res[0] || {}),
      base44.entities.HomePageSettings.list().then(res => res[0] || {}),
      base44.entities.AboutPageSettings.list().then(res => res[0] || {}),
      base44.entities.PersonalPageSettings.list().then(res => res[0] || {}),
      base44.entities.CorporatePageSettings.list().then(res => res[0] || {}),
      base44.entities.TestimonialsPageSettings.list().then(res => res[0] || {}),
      base44.entities.PodcastPageSettings.list().then(res => res[0] || {}),
      base44.entities.BlogPageSettings.list().then(res => res[0] || {}),
      base44.entities.ContactPageSettings.list().then(res => res[0] || {}),
      base44.entities.BlogPost.list(),
      base44.entities.Testimonial.list(),
      base44.entities.PersonalWorkshop.list(),
      base44.entities.CorporateLecture.list(),
      base44.entities.PodcastEpisode.list(),
    ]);

    const exportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        exported_by: user.email,
        version: "1.0"
      },
      settings: {
        global: globalSettings,
        home: homeSettings,
        about: aboutSettings,
        personal: personalSettings,
        corporate: corporateSettings,
        testimonials: testimonialsSettings,
        podcast: podcastSettings,
        blog: blogSettings,
        contact: contactSettings
      },
      content: {
        blog_posts: blogPosts,
        testimonials: testimonials,
        workshops: workshops,
        lectures: lectures,
        episodes: episodes
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const filename = `site-backup-${new Date().toISOString().split('T')[0]}.json`;

    return new Response(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});