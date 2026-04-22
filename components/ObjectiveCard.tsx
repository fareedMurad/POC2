const ObjectiveCard = ({
  category,
  objective,
  bullets,
}: {
  category?: string;
  objective?: string;
  bullets?: string;
}) => {
  const getBullets = (bullets?: string) => {
    if (!bullets || typeof bullets !== "string") return [];

    return bullets
      .split("|")
      .map((b) => b.trim())
      .filter(Boolean);
  };

  const bulletList = getBullets(bullets);

  return (
    <div className="bg-[#2D313A] rounded-xl py-8 px-6">
      {/* Category badge */}
      {category && (
        <span className="inline-block bg-[#413939] text-[#F3812E] text-[16px] px-3 py-1 rounded-full mb-3">
          {category}
        </span>
      )}

      {/* Objective title */}
      {objective && (
        <h4 className="text-white text-lg font-medium mb-3">{objective}</h4>
      )}

      {/* Bullets */}
      <ul className="space-y-2">
        {bulletList.map((item, idx) => (
          <li key={idx} className="flex items-start text-[#BBBBBB] text-[14px]">
            <span className="w-1.75 h-1.75 bg-[#68AD5C] rounded-full mt-2 mr-2 shrink-0"></span>
            {item?.charAt(0).toUpperCase() + item?.slice(1)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ObjectiveCard;
