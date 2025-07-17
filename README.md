# Iran Proxy Scraper

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions)

An automated system that scrapes, validates, and serves a live list of Iranian proxies to help users navigate internet restrictions.

---

## 🟢 Static Site

**Check out the live, auto-updating proxy list here:**

**[https://daniyal-abbassi.github.io/iran-proxy/](https://daniyal-abbassi.github.io/iran-proxy/)**

---

## 🎯 The Purpose

In Iran, access to the global internet is often restricted or filtered, particularly during significant social or political events. During these periods, the internet can effectively become a national "intranet," with access to foreign websites and services blocked.

This project was created to provide a reliable, up-to-date list of working Iranian proxies. These proxies can serve as a potential gateway or a "first hop" for users trying to access the open internet. By automating the process of finding and validating these proxies, this tool aims to save users time and provide a valuable resource in the ongoing effort to maintain digital freedom.

## ✨ Features

- **Automated Scraping:** Runs on a schedule using GitHub Actions to scrape proxies from multiple public sources.
- **High-Performance Validation:** Uses a fast, asynchronous checker to validate proxies for multiple protocols (HTTP, SOCKS4, SOCKS5).
- **Data Persistence:** Stores and tracks proxies in a local SQLite database using Prisma for data integrity.
- **Auto-Updating Static Site:** The final list of working proxies is automatically published to a static JSON file, which is then displayed on a clean, responsive site hosted by GitHub Pages.
- **Portable Tool:** The script can be run locally by any user to get a proxy list that is 100% accurate for their specific ISP and network conditions.

## 🛠️ Technology Stack

- **Backend:** Node.js
- **Database:** SQLite
- **ORM:** Prisma
- **Scraping:** Axios, Cheerio
- **Proxy Checking:** Node.js `net` module, `socks` library
- **Automation:** GitHub Actions
- **Hosting:** GitHub Pages

## ⚙️ How It Works

The project runs on a fully automated CI/CD pipeline managed by GitHub Actions.

1.  **Schedule Trigger:** The workflow starts automatically every 6 hours.
2.  **Scrape:** The script scrapes raw proxy lists from various online sources.
3.  **Validate:** The high-performance checker validates hundreds of proxies in parallel, checking for protocol type and latency.
4.  **Update Database:** The results are saved to an SQLite database. The script uses Prisma's `upsert` command to either create new proxy entries or update existing ones.
5.  **Generate Static JSON:** The script queries the database for all currently working proxies and writes them to the `public/proxies.json` file.
6.  **Commit & Push:** The GitHub Action automatically commits the updated `proxies.json` file and the `dev.db` database file back to the repository.
7.  **Deploy:** The push to the `main` branch triggers a GitHub Pages deployment, making the fresh data instantly available on the live site.

## 🚀 Running Locally

You can run this project on your own machine to get a proxy list tailored to your specific ISP.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)

### Setup and Execution

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/daniyal-abbassi/iran-proxy.git](https://github.com/daniyal-abbassi/iran-proxy.git)
    cd iran-proxy
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    This command will create your local SQLite database file and prepare the Prisma client.
    ```bash
    npx prisma migrate dev
    ```

4.  **Run the script:**
    ```bash
    node scraper.js
    ```

The script will run the full scrape-and-check process and output a table of working proxies directly in your console.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/daniyal-abbassi/iran-proxy/issues).

## 📄 License

This project is licensed under the MIT License.