
interface IconProps {
    className?: string,
    name: string,
}

export default function Icon ( {className, name }: IconProps ) {
    return (
      <svg className={className}>
          <use href={`/sprite.svg#${name}`}></use>
      </svg>
    )
}