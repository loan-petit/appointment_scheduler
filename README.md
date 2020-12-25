# Appointment Scheduler

This website is available online at <https://www.appointment-scheduler.loanpetit.com/>, check it out.

## Application deployment

Thanks to GitHub Actions, the deployment process is fully automatized.
It triggers when something is pushed onto master.

The application is deployed to a Docker Swarm using Docker images saved in [petitloan/appointment_scheduler](https://hub.docker.com/r/petitloan/appointment_scheduler/) Docker Hub public repository.

When the deployment is finished, the following services should be running on the hosting server.
- **Traefik cloud native router** (named *traefik*): Based on traefik:v2.2
- **Next.js app** (named *next_app*): Based on petitloan/appointment_scheduler:next_app
- **Prisma API based on GraphQL** (named *prisma*): Based on petitloan/appointment_scheduler:prisma
- **PostgreSQL database** (named *postgres*): Based on postgres:12-alpine

## Contact me

The preferred way of contacting me is to send me an email at <petit.loan1@gmail.com>.

Here are some other places where you can find me at:

**LinkedIn**: <https://www.linkedin.com/in/loanpetit/>

**Malt**: <https://www.malt.fr/profile/loanpetit/>