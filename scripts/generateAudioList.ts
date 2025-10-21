import { readdirSync } from "fs";
import { writeFileSync } from "fs";
import { join } from "path";

const audioDir = join(process.cwd(), "public/3");
const outputFile = join(process.cwd(), "src/audioFiles.json");

function formatDate(dateStr: string, timeStr: string): string {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  const hour = parseInt(timeStr.substring(0, 2));
  const minute = timeStr.substring(2, 4);

  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = months[parseInt(month) - 1];

  return `${hour12}:${minute}${ampm} ${monthName} ${parseInt(day)}, ${year}`;
}

try {
  const files = readdirSync(audioDir)
    .filter((file) => file.match(/\.(m4a|mp3|wav|ogg)$/i))
    .sort()
    .reverse()
    .map((file) => {
      const match = file.match(/^(\d{8})_(\d{6})_(.+)\.(m4a|mp3|wav|ogg)$/i);

      if (match) {
        const dateStr = match[1];
        const timeStr = match[2];
        const name = match[3];

        return {
          path: `/3/${file}`,
          name: name,
          date: formatDate(dateStr, timeStr),
        };
      }

      return {
        path: `/3/${file}`,
        name: file.replace(/\.(m4a|mp3|wav|ogg)$/i, ""),
        date: undefined,
      };
    });

  writeFileSync(outputFile, JSON.stringify(files, null, 2));
  console.log(`Generated audio list with ${files.length} files`);
} catch (error) {
  console.error("Error generating audio list:", error);
  writeFileSync(outputFile, JSON.stringify([], null, 2));
}
