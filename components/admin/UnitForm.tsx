import { createUnit } from '@/app/actions/units';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UnitForm = () => {
  return (
    <form action={createUnit} className="space-y-4">
      <div>
        <Label htmlFor="name">Unit Name</Label>
        <Input id="name" name="name" required />
      </div>
      <Button type="submit">Create Unit</Button>
    </form>
  );
};

export default UnitForm;
