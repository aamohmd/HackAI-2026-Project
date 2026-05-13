import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { usersApi } from '@/api/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { CircleNotch, Warning } from '@phosphor-icons/react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHRASE = "DELETE MY ACCOUNT";

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (!password) {
      setError("Password is required");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleDelete = async () => {
    if (confirmationPhrase !== PHRASE) {
      setError(`Please type "${PHRASE}" exactly`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await usersApi.deleteAccount({
        password,
        confirmation_phrase: confirmationPhrase,
      });
      
      // Success: Logout and redirect
      await logout();
      navigate('/login');
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      setError(err.response?.data?.detail || "Failed to delete account. Check your password.");
      setStep(1); // Go back to password step
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setPassword('');
    setConfirmationPhrase('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Warning size={24} weight="fill" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action is irreversible. All your data will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-2">
              <Label htmlFor="password">Confirm with Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phrase">
                Type <span className="font-bold text-foreground">"{PHRASE}"</span> to confirm
              </Label>
              <Input
                id="phrase"
                placeholder={PHRASE}
                value={confirmationPhrase}
                onChange={(e) => setConfirmationPhrase(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={resetAndClose} disabled={isLoading}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button variant="destructive" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isLoading || confirmationPhrase !== PHRASE}
            >
              {isLoading ? (
                <>
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Permanently Delete'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
