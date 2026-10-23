import { FC, useState, createContext, Dispatch, SetStateAction } from 'react';
type TitleContext = {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  /** true while a page renders its own large header (ListPageHeader) */
  hideHeaderTitle: boolean;
  setHideHeaderTitle: Dispatch<SetStateAction<boolean>>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TitleContext = createContext<TitleContext>({} as TitleContext);

export const TitleProvider: FC = ({ children }) => {
  const [title, setTitle] = useState<string>('');
  const [hideHeaderTitle, setHideHeaderTitle] = useState<boolean>(false);

  return (
    <TitleContext.Provider
      value={{ title, setTitle, hideHeaderTitle, setHideHeaderTitle }}
    >
      {children}
    </TitleContext.Provider>
  );
};
