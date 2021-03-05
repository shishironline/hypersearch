import { FunctionComponent, Dispatch, SetStateAction, MouseEvent } from 'react';

declare module './AddAugmentationTab' {
  type AddAugmentationTabProps = {
    active: boolean;
    setActiveKey: Dispatch<SetStateAction<string>>;
    numInstalledAugmentations: number;
    onClick?: (e: MouseEvent<HTMLDivElement, any>) => void;
  };

  type AddAugmentationTab = FunctionComponent<AddAugmentationTabProps>;
}
