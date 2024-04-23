function formatDuration(duration) {
  const seconds = Math.floor(duration / 1000) % 60;
  const minutes = Math.floor(duration / (1000 * 60)) % 60;
  const hours = Math.floor(duration / (1000 * 60 * 60));

  return `${hours}:${minutes}:${seconds}`;
}

const tanggal_down = "2023-01-01";
const down_time_key = "00:05:00";
const tanggal = "2023-01-05";
const time = "00:05:00";

const downTimeObject = new Date(`${tanggal_down} ${down_time_key}`);
const currentTimeObject = new Date(`${tanggal} ${time}`);
console.log(downTimeObject);
console.log(currentTimeObject);

const durasi_down = currentTimeObject - downTimeObject;
const formattedDuration = formatDuration(durasi_down);
console.log(formattedDuration);
