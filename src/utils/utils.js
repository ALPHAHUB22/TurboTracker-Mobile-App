

export async function getTime(hoursToAdd=0) {
  const now = new Date();
  if(hoursToAdd>0){
    now.setHours(now.getHours() + hoursToAdd); // Add dynamic hours
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  // const seconds = String(now.getSeconds()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 24-hour to 12-hour format

  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}