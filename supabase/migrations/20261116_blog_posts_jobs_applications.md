# blog_posts_jobs_applications

Applied to the Supabase project on 2026-11-16. The exact SQL is in the project's migration
history (`supabase db pull` writes it out as a `.sql` file).

| Table | Purpose | Who can read | Who can write |
| --- | --- | --- | --- |
| `posts` | Blog articles. Drafts stay hidden until `is_published` is on. | Everyone (published only); admins see drafts | Admins |
| `jobs` | Open roles for the careers page. | Everyone (open roles only); admins see closed ones | Admins |
| `job_applications` | Applications sent from a job page. | Admins only | Anyone may apply to an open role; admins change the status |

Four sample posts and three sample roles were loaded afterwards. They are stand-ins:
edit or replace them in the admin area (Blog and Careers) before launch.
