import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { useOptimization } from "@/contexts/OptimizationContext";
import { useForm } from "react-hook-form";
import { type CutOptions } from "@/types";

const CutOptionsInput = () => {
  const { options, setOptions } = useOptimization();

  const form = useForm<CutOptions>({
    defaultValues: options,
  });

  const onSubmit = (data: CutOptions) => {
    setOptions(data);
  };

  return (
    <div className="bg-white shadow-md rounded-md p-4">
      <h2 className="text-sm font-semibold mb-4 flex items-center">
        <div className="bg-primary text-white p-0.5 rounded mr-2">
          <Settings size={16} />
        </div>
        Options de découpe
      </h2>

      <Form {...form}>
        <form onChange={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex flex-col gap-3">
            <Card className="shadow-sm">
              <CardHeader className="pb-1 pt-2 px-3">
                <CardTitle className="text-xs">Épaisseur de coupe</CardTitle>
              </CardHeader>
              <CardContent className="pt-1 px-3 pb-3">
                <FormField
                  control={form.control}
                  name="kerfThickness"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col space-y-2">
                        <FormLabel className="text-xs">Épaisseur de lame / kerf (mm): {field.value.toFixed(1)}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-1 pt-2 px-3">
                <CardTitle className="text-xs">Orientation et rotation</CardTitle>
              </CardHeader>
              <CardContent className="pt-1 px-3 pb-3">
                <FormField
                  control={form.control}
                  name="allowRotation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs">Autoriser la rotation</FormLabel>
                        <FormDescription className="text-xs text-gray-500 text-[11px]">
                          Permet de pivoter les panneaux pour optimiser l'espace
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75 data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="considerGrainDirection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between mt-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs">Direction du grain</FormLabel>
                        <FormDescription className="text-xs text-gray-500 text-[11px]">
                          Tenir compte de la direction du grain (bois)
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75 data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-1 pt-2 px-3">
                <CardTitle className="text-xs">Priorités d'optimisation</CardTitle>
              </CardHeader>
              <CardContent className="pt-1 px-3 pb-3">
                <FormField
                  control={form.control}
                  name="prioritizeMinimalWaste"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs">Minimiser les déchets</FormLabel>
                        <FormDescription className="text-xs text-gray-500 text-[11px]">
                          Priorité à la minimisation des déchets
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75 data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioritizeMinimalCuts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between mt-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs">Minimiser les coupes</FormLabel>
                        <FormDescription className="text-xs text-gray-500 text-[11px]">
                          Priorité à la réduction du nombre de coupes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75 data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="useOnlyOneSheetType"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between mt-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs">Une seule feuille de stock</FormLabel>
                        <FormDescription className="text-xs text-gray-500 text-[11px]">
                          Utiliser un seul type de feuille de stock
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75 data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-1 pt-2 px-3">
                <CardTitle className="text-xs">Finitions</CardTitle>
              </CardHeader>
              <CardContent className="pt-1 px-3 pb-3">
                <FormField
                  control={form.control}
                  name="edgeBanding"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs">Chants plaqués</FormLabel>
                        <FormDescription className="text-xs text-gray-500 text-[11px]">
                          Tenir compte des chants plaqués (placage de bordure)
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75 data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("edgeBanding") && (
                  <FormField
                    control={form.control}
                    name="edgeBandingThickness"
                    render={({ field }) => (
                      <FormItem className="mt-3">
                        <div className="flex flex-col space-y-2">
                          <FormLabel className="text-xs">Épaisseur du chant (mm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={field.value}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className="w-full h-7 text-xs"
                            />
                          </FormControl>
                          <Slider
                            min={0}
                            max={3}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CutOptionsInput;
