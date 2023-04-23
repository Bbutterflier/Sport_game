# ESPN scraper

## Introduction

This is a simple web app that scrapes ESPN's website for the latest news and stats about a team. It uses Node.js's Fetch to scrape the API and Next.js to render the page.

From the ESPN API, the app scrapes the following data in real time. So one report consists of the following data:

- Top 10 Available Players by % Rostered Across All Leagues
- Top 10 Available Players Rising in Popularity
- Top 10 Available Players by Average Points over past 15 Days
- Current Players OUT
- Current Benched Players w/Game Scheduled
- Probable Starting Pitchers on the Bench

## Fetching the teams

In theory, the teams have to be retrieved from the ESPN API. However, the ESPN API does not return the team names. So the team names are hard-coded in the app (see pages/report/[teamIndex].tsx.

The teams are not part of the HTML content, nor from any of the API calls (included in the HAR export from the browser).

There was an attempt to scrape the teams directly from the ESPN website, using Puppeteer, however the website is heavily protected against scraping.

Issues are:

- Hovering the profile icon does not open the menu
- Triggering click events does not trigger the corresponding actions
- Recaptcha seems to be active also

## API

There is a single API endpoint that returns the data for a given report.

### GET /api/report/{teamIndex}

Returns the report data for a given team.

The source code is in the pages/api/report.ts file.

### POST /api/report/{teamIndex} (TODO - not fully implemented yet)

Sends an email using the configured Sengrid API key.
The email contains the report data for a given team.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

## URLs

Locally, you can browse to: http://localhost:3000/report/{teamIndex}

The app is deployed on a free tier Vercel host that is linked to a Github repository. The app is deployed automatically when a commit is pushed to the repository.

teamIndex can be 1, 2, 3 or 4.

https://espn-scraper.vercel.app/report/{teamIndex}

# Things to finish

- [ ] Add some missing data
- [ ] Fetch the teams of the user from the ESPN API
- [ ] Send the report by email