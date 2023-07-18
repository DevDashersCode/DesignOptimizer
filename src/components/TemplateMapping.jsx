import AddMapping from './AddMapping';
import AddMappingData from './MappingData';

const TemplateMapping = () => {
  return (
    <div className="parentContainer">
      <div className="firstPortion">
        <AddMappingData />
      </div>
      <div className="secondPortion">
        <AddMapping />
      </div>
    </div>
  );
};

export default TemplateMapping;
