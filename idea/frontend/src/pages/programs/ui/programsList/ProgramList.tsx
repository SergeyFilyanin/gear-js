import SimpleBar from 'simplebar-react';

import { useScrollLoader } from 'hooks';
import { Placeholder } from 'entities/placeholder';
import { IProgram, HorizontalProgramCard } from 'entities/program';
import { ExamplesLink } from 'shared/ui/examplesLink';
import { ReactComponent as HorizontalProgramCardSVG } from 'shared/assets/images/placeholders/horizontalProgramCard.svg';

import styles from './ProgramsList.module.scss';

type Props = {
  programs: IProgram[];
  isLoading: boolean;
  totalCount: number;
  loadMorePrograms: () => void;
};

const ProgramsList = (props: Props) => {
  const { programs, isLoading, totalCount, loadMorePrograms } = props;

  const hasMore = !isLoading && programs.length < totalCount;
  const isEmpty = !(isLoading || totalCount);
  const isLoaderShowing = isEmpty || (!totalCount && isLoading);

  const scrollableNodeRef = useScrollLoader<HTMLDivElement>(loadMorePrograms, hasMore);

  return (
    <div className={styles.programsList}>
      {isLoaderShowing ? (
        <Placeholder
          block={<HorizontalProgramCardSVG className={styles.placeholderBlock} />}
          title="There are no programs yet"
          description="You can start experimenting right now or try to build from examples. Let's Rock!"
          isEmpty={isEmpty}
          blocksCount={4}>
          <ExamplesLink />
        </Placeholder>
      ) : (
        <SimpleBar className={styles.simpleBar} scrollableNodeProps={{ ref: scrollableNodeRef }}>
          {programs.map((program) => (
            <HorizontalProgramCard key={program.id} program={program} />
          ))}
        </SimpleBar>
      )}
    </div>
  );
};

export { ProgramsList };