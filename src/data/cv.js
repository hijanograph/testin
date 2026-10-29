// El contenido del currículum vive en src/data/cv.md.
// Aquí solo quedan los enlaces de descarga.
export const cvDriveId = '16K_kHrIxXQuXzdytIGrX46_dsheItNwA';
export const portfolioDriveId = '1p5WQXuLPW-kFGgMLAzbrCEaSUpG7zqYD';

const driveDownload = (id) => `https://drive.google.com/uc?export=download&id=${id}`;

export const cvDownloadUrl = driveDownload(cvDriveId);
export const portfolioDownloadUrl = driveDownload(portfolioDriveId);
