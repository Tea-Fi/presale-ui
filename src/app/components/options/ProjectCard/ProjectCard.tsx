import { ProjectInfoOption } from "../../../../types/options.ts";
import Spinner from "../../spinner.tsx";
import { Progress } from "../../ui";

interface ProjectCardProps {
  info: ProjectInfoOption;
}
export const ProjectCard = ({ info }: ProjectCardProps) => {
  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="inline-flex justify-between text-zinc-400 text-sm">
        <span>{info.title == null ? <Spinner /> : info.title}</span>
        <div>
          <span>
            {info.value == null && info.max ? (
              <Spinner />
            ) : (
              (+info.max - +info.value).toLocaleString("en-US")
            )}
          </span>
        </div>
      </div>
      <Progress value={info.max - info.value} max={info.max} reverse />
    </div>
  );
};
