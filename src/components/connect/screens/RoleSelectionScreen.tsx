import { KeyRound, Users } from 'lucide-react';

import RoleCard from '../RoleCard';
import { Role } from '../types';

interface RoleSelectionScreenProps {
  onRoleSelect: (role: Role) => void;
}

export const RoleSelectionScreen = ({ onRoleSelect }: RoleSelectionScreenProps) => (
  <div className="flex gap-4">
    <RoleCard
      icon={<KeyRound className="h-5 w-5" />}
      title="Root Key Holder"
      description="Root key holders can manage verifiers and datacap allocations at the highest level."
      buttonText="Connect as Root"
      onClick={() => onRoleSelect('root')}
    />
    <RoleCard
      icon={<Users className="h-5 w-5" />}
      title="Meta Allocator"
      description="Meta allocators can manage datacap allocations for specific regions or use cases."
      buttonText="Connect as Allocator"
      onClick={() => onRoleSelect('meta-allocator')}
    />
  </div>
);
