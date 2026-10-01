<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed the storefront catalogue with the starter leather cases.
     *
     * Uses updateOrCreate so the seeder can be re-run safely and will simply
     * refresh the known products instead of duplicating them.
     */
    public function run(): void
    {
        foreach ($this->catalogue() as $product) {
            Product::updateOrCreate(['name' => $product['name']], $product);
        }
    }

    /**
     * Build the starter catalogue, mirroring the images shipped in public/images/case.
     *
     * @return list<array<string, mixed>>
     */
    private function catalogue(): array
    {
        $caseImage = static fn (string $folder, string $file): string => '/images/case/'.rawurlencode($folder).'/'.rawurlencode($file);

        return [
            [
                'name' => 'Argus G3',
                'price' => 109,
                'tag' => 'New arrival',
                'category' => 'Case',
                'color' => 'bg-stone-200',
                'marketplace_url' => 'https://www.tokopedia.com/indomarkers/vagary-leather-sleeve-case-kulit-asli-argus-g3-free-lanyard-1731881199768209039?extParam=src%3Dshop%26whid%3D1362348&aff_unique_id=&channel=others&chain_key=',
                'image' => $caseImage('Argus G3', 'IMG-20250708-WA0001.jpg'),
                'gallery' => [
                    $caseImage('Argus G3', 'IMG-20250708-WA0001.jpg'),
                    $caseImage('Argus G3', 'IMG-20250708-WA0002.jpg'),
                    $caseImage('Argus G3', 'IMG-20250708-WA0003.jpg'),
                ],
                'specs' => [
                    ['label' => 'Format', 'value' => 'Protective case'],
                    ['label' => 'Focus', 'value' => 'Everyday carry'],
                    ['label' => 'Best for', 'value' => 'A refined daily companion'],
                ],
                'is_featured' => true,
            ],
            [
                'name' => 'Xlim Pro 2',
                'price' => 149,
                'tag' => 'Featured',
                'category' => 'Case',
                'color' => 'bg-orange-100',
                'marketplace_url' => 'https://shopee.co.id/Vagary-Leather-Sleeve-Case-O.X.V.A-Xlim-Pro-2-Xlim-Pro-2-DNA-Free-Lanyard-i.153295098.26859360918?extraParams=%7B%22display_model_id%22%3A226706397911%2C%22model_selection_logic%22%3A3%7D',
                'image' => $caseImage('Xlim Pro 2', 'DNA 001.jpeg'),
                'gallery' => [
                    $caseImage('Xlim Pro 2', 'DNA 001.jpeg'),
                    $caseImage('Xlim Pro 2', 'DNA 002.jpeg'),
                    $caseImage('Xlim Pro 2', 'DNA.jpeg'),
                ],
                'specs' => [
                    ['label' => 'Format', 'value' => 'Protective case'],
                    ['label' => 'Focus', 'value' => 'Premium finish'],
                    ['label' => 'Best for', 'value' => 'A statement accessory'],
                ],
                'is_featured' => true,
            ],
            [
                'name' => 'Xlim Pro 3',
                'price' => 179,
                'tag' => 'Popular',
                'category' => 'Case',
                'color' => 'bg-slate-200',
                'marketplace_url' => 'https://shopee.co.id/Casing-Pro-3-(100-Terbuat-dari-Kulit-Asli)-dan-Grastis-Lanyard-i.153295098.45760187354?extraParams=%7B%22display_model_id%22%3A440893508605%2C%22model_selection_logic%22%3A3%7D',
                'image' => $caseImage('Xlim Pro 3', 'WhatsApp Image 2026-05-08 at 13.52.52.jpeg'),
                'gallery' => [
                    $caseImage('Xlim Pro 3', 'WhatsApp Image 2026-05-08 at 13.52.50.jpeg'),
                    $caseImage('Xlim Pro 3', 'WhatsApp Image 2026-05-08 at 13.52.51.jpeg'),
                    $caseImage('Xlim Pro 3', 'WhatsApp Image 2026-05-08 at 13.52.52.jpeg'),
                ],
                'specs' => [
                    ['label' => 'Format', 'value' => 'Protective case'],
                    ['label' => 'Focus', 'value' => 'Modern styling'],
                    ['label' => 'Best for', 'value' => 'An elevated everyday carry'],
                ],
                'is_featured' => true,
            ],
            [
                'name' => 'Xros 5',
                'price' => 199,
                'tag' => 'Top rated',
                'category' => 'Case',
                'color' => 'bg-neutral-200',
                'marketplace_url' => 'https://www.tokopedia.com/toko-kulitku/vagary-leather-casing-xros-5-mini-100-kulit-asli-grastis-lanyard-1735663096378853250-1735663404119984002?extParam=ivf%3Dfalse%26keyword%3Dxros+5+sleeve+case+vagary%26search_id%3D2026093005230082CEC96096D428104BG4%26src%3Dsearch',
                'image' => $caseImage('Xros 5', 'WhatsApp Image 2026-05-08 at 13.53.09.jpeg'),
                'gallery' => [
                    $caseImage('Xros 5', 'WhatsApp Image 2026-05-08 at 13.53.06.jpeg'),
                    $caseImage('Xros 5', 'WhatsApp Image 2026-05-08 at 13.53.08.jpeg'),
                    $caseImage('Xros 5', 'WhatsApp Image 2026-05-08 at 13.53.09.jpeg'),
                ],
                'specs' => [
                    ['label' => 'Format', 'value' => 'Protective case'],
                    ['label' => 'Focus', 'value' => 'Built to stand out'],
                    ['label' => 'Best for', 'value' => 'A premium, polished finish'],
                ],
                'is_featured' => true,
            ],
        ];
    }
}
