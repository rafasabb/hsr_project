import AddRelicForm from '../components/AddRelicForm';
import RelicsList from '../components/RelicsList';
import ImportRelicForm from '../components/ImportRelicForm';;

export default function RelicsPage() {

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Relic Management</h1>
      
      <div className="flex flex-row gap-6">
        {/* Add Relic Form - Sidebar */}
        <div className="w-80 shrink-0">
          <ImportRelicForm />
          <AddRelicForm/>
        </div>
        
        {/* Relics List - Main Content */}
        <div className="flex-grow">
          <RelicsList />
        </div>
      </div>
    </div>
  );
}