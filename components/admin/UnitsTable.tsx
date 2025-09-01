import { Unit } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const UnitsTable = ({ units }: { units: Unit[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {units.map((unit) => (
          <TableRow key={unit.id}>
            <TableCell>{unit.id}</TableCell>
            <TableCell>{unit.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UnitsTable;
