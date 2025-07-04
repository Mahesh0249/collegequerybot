const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const FACULTY_URL = 'https://www.vrsiddhartha.ac.in/faculty-u-2/';

async function scrapeFaculty() {
  const { data } = await axios.get(FACULTY_URL);
  const $ = cheerio.load(data);

  const faculty = [];
  $('table').each((i, table) => {
    $(table).find('tr').slice(1).each((_, row) => {
      const cols = $(row).find('td');
      if (cols.length < 4) return;
      faculty.push({
        department: $(cols[1]).text().trim(),
        name: $(cols[2]).text().trim(),
        designation: $(cols[3]).text().trim()
      });
    });
  });

  fs.writeFileSync('faculty.json', JSON.stringify(faculty, null, 2), 'utf-8');
  console.log(`Scraped ${faculty.length} faculty records.`);
}

scrapeFaculty().catch(console.error); 