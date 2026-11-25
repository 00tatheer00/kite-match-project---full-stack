'use client';

import HomePageContent from "../components/HomePageContent";

// Organization / WebSite / FAQ structured data are rendered on the server (app/layout.js, app/page.js).
const HomePage = ({ initialProducts = [], heroSettings = null }) => (
  <HomePageContent initialProducts={initialProducts} heroSettings={heroSettings} />
);

export default HomePage;
