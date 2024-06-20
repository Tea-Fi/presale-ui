export const getTimeDiffrenece = (date: number) => {
  const targetDate = new Date(date);
  const currentTime = new Date();

  const timeDiffrence = Math.abs(currentTime.valueOf() - targetDate.valueOf());
  const diffrenceInMinutes = Math.round(timeDiffrence / 60000);
  const diffrenceInHours = Math.round(timeDiffrence / 3600000);
  const diffrenceInDays = Math.round(timeDiffrence / 86400000);

  if (diffrenceInMinutes === 0) {
    return 'soon';
  } else if (diffrenceInMinutes < 60) {
    return `${diffrenceInMinutes} minute${diffrenceInMinutes === 1 ? '' : 's'}`;
  } else if (diffrenceInHours < 24) {
    return `${diffrenceInHours} hour${diffrenceInHours === 1 ? '' : 's'}`;
  } else {
    return `${diffrenceInDays} day${diffrenceInDays === 1 ? '' : 's'}`;
  }
};
