
import { Link } from "react-router-dom";

const TagguiLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 bg-taggui-primary text-white rounded">
        <span className="font-bold text-lg">T</span>
      </div>
      <span className="font-bold text-xl tracking-tight">TAGGUI</span>
    </Link>
  );
};

export default TagguiLogo;
