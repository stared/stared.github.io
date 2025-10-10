/**
 * Fetch text component pages from the content collection
 */
export const contentPage = async (pageName: string) => {
  return await useAsyncData(`${pageName}-content`, async () => {
    return await queryCollection("textComponents")
      .path(`/text-components/${pageName}`)
      .first();
  });
};
