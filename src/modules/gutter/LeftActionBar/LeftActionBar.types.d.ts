import { FunctionComponent } from 'react';

declare module './LeftActionBar' {
  type LeftActionBarProps = {
    publication: string;
    container: string;
    searchingAugmentations: AugmentationObject[];
    blockingAugmentations: AugmentationObject[];
    featuringAugmentations: AugmentationObject[];
  };

  type LeftActionBar = FunctionComponent<LeftActionBarProps>;
}
