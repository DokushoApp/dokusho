import React from 'react';
import { useNavigate } from 'react-router';
import {
  Puzzle,
  PlugZap,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ExtensionEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto my-4 bg-muted rounded-full p-3 w-16 h-16 flex items-center justify-center">
            <Puzzle className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">No Extensions Found</CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You need to install extensions to browse manga from online sources.
          </p>

          <div className="space-y-2 mt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <PlugZap className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Extensions provide access</p>
                <p className="text-sm text-muted-foreground">Connect to various online manga sources</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Easy to configure</p>
                <p className="text-sm text-muted-foreground">Install extensions from the settings page</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={() => navigate('/settings')}
          >
            Go to Extensions Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExtensionEmptyState;