import { PrismaClient } from '@prisma/client';
import AdminLayout from '../../components/AdminLayout';
import UnitForm from '../../components/admin/UnitForm';
import UnitsTable from '../../components/admin/UnitsTable';

const prisma = new PrismaClient();

export async function getServerSideProps() {
  const units = await prisma.unit.findMany();
  return {
    props: { units },
  };
}

const UnitsPage = ({ units }) => {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Units</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Existing Units</h2>
          <UnitsTable units={units} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Create a New Unit</h2>
          <UnitForm />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UnitsPage;
