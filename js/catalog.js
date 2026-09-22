/* August — real catalog sample pulled from august-shop.com (Shopify products.json).
   Images hotlink Shopify's CDN — fine for the prototype; at port time this
   whole file disappears and Liquid iterates real collections instead. */
window.AugustCatalog = (() => {
  const PRODUCTS = [
  {
    "title": "Nike Men's ACG \"Second Sunrise\" Dri-FIT ADV 5\u2026",
    "brand": "Nike",
    "dept": "men",
    "cat": "apparel",
    "sale": false,
    "price": 85.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_f903cbd1-5b67-4112-8e8d-4d62117640fa.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_1e333fd5-4743-4416-bb06-26cb4838f324.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_46be356c-dede-493f-9980-0ae86a2b77ac.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_296a750e-e309-4734-a777-a8ba4da69720.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_1e879c04-2be1-459e-a6f9-d1d61f349445.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_b2b8ab41-bf87-4f27-bcdc-7c17e587be26.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar Control 5",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 100.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_f34c7189-2b70-454e-9fd8-1ceaf1873186.jpg?width=600"
  },
  {
    "title": "Saucony Men's Progrid Guide 7",
    "brand": "Saucony",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 94.0,
    "compare": 135.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/39_1390b492-8a82-4684-85f7-6979ac4bfc5e.jpg?width=600"
  },
  {
    "title": "Nike Men's Zoom Hyperflight \"DMV\"",
    "brand": "Nike",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/25_f102437e-cc44-4d60-bef5-4d8505e3e161.jpg?width=600"
  },
  {
    "title": "Nike Men's Air Max 95 Tech",
    "brand": "Nike",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 139.0,
    "compare": 200.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_a839bcfe-c078-4c14-828a-b20d1b13074e.jpg?width=600"
  },
  {
    "title": "Nike Men's Air Foamposite Pro \"Voltage\"",
    "brand": "Nike",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 164.0,
    "compare": 240.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_50ccb45e-ffa0-4050-aa13-ae13dbbcec48.jpg?width=600"
  },
  {
    "title": "Birkenstock Men's Arizona Leather Woven - Reg\u2026",
    "brand": "Birkenstock",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/3_032864bd-181d-490f-a85d-92a61087eef2.jpg?width=600"
  },
  {
    "title": "Nike Men's Kobe Air Force 1 Low \"Daybreak\"",
    "brand": "Nike",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 84.0,
    "compare": 120.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_793ba973-0993-4b2f-93c3-bea61876500a.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Vegas Cardholder",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 65.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_52ca17ca-d2e1-42cd-92be-ad7e951e20b7.jpg?width=600"
  },
  {
    "title": "New Era x Seinfeld Baltimore Orioles 9TWENTY",
    "brand": "New Era",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 46.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_c60e60b1-74b3-48d5-ba60-824fc107799f.jpg?width=600"
  },
  {
    "title": "New Era x Seinfeld New York Mets 9TWENTY",
    "brand": "New Era",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 46.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_47fd0798-bd0a-4cdc-8fbd-a642a6309c13.jpg?width=600"
  },
  {
    "title": "New Era x Seinfeld New York Yankees 9TWENTY",
    "brand": "New Era",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 46.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_e2a73498-2ce3-4a57-9825-1b574a20b51c.jpg?width=600"
  },
  {
    "title": "Carne Bollente Hoofin It Socks",
    "brand": "Carne Bollente",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 25.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_62706270-9684-4fbf-8c79-13ee7b835343.jpg?width=600"
  },
  {
    "title": "Online Ceramics Online Mountains Hat",
    "brand": "Online Ceramics",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 45.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_ba0617ad-fe8a-4022-b472-ec20b3cf2f17.jpg?width=600"
  },
  {
    "title": "Dude. Your Team Socks. Checkered Socks",
    "brand": "Dude. Your Team Socks.",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 15.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/GreenWhite.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Anglistic Sweater",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 165.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_1bfcaac1-70f7-45e1-b198-308bb9c2655b.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Bagley Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 165.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_b04d0c2d-9020-42f4-99a2-2579a1f043a1.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Vista T-Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 68.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_ab991a73-ae88-440b-8471-ba92c6813a16.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Vista T-Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 68.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_c0bf0ee6-f1fb-40ec-8bb1-2b8fc026750c.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Lambert T-Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 65.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_792b1a7a-34cb-4cc6-96e4-95abcfcf6496.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Chez WIP T-Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 58.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_a42921da-5fac-43de-a173-68014f4d3ea9.jpg?width=600"
  },
  {
    "title": "Online Ceramics God is Alive and Well Tee",
    "brand": "Online Ceramics",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 44.0,
    "compare": 68.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_47525ab6-9492-4602-86de-844164a3d6ad.jpg?width=600"
  },
  {
    "title": "Online Ceramics Back By Popular Demand Tee",
    "brand": "Online Ceramics",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 44.0,
    "compare": 68.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_47199a51-0cfb-45b2-a654-318e57cba80e.jpg?width=600"
  },
  {
    "title": "Butter Goods Stars Polo Polo S/S Shirt",
    "brand": "Butter Goods",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 69.0,
    "compare": 102.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/9_3c9083b8-d99b-412d-b16f-db3cd2bfb1f2.jpg?width=600"
  },
  {
    "title": "Butter Goods Relaxed Denim Jeans",
    "brand": "Butter Goods",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 74.0,
    "compare": 110.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/39_d1b1bab4-d53b-438e-a397-7ca20acdfa9a.jpg?width=600"
  },
  {
    "title": "Full Court Press NBA Japan Games '92 Longslee\u2026",
    "brand": "Full Court Press",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 39.0,
    "compare": 55.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/FCP_FIX.jpg?width=600"
  },
  {
    "title": "Full Court Press Terror Squad Vs. Roc-A-Fella\u2026",
    "brand": "Full Court Press",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 34.0,
    "compare": 45.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_7448bfbc-a1b4-41fc-bbaa-432e863c86fe.jpg?width=600"
  },
  {
    "title": "Converse Unisex Run Star Crush Ox",
    "brand": "Converse",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 130.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_ade29946-d903-4f46-b906-b99e221f094a.jpg?width=600"
  },
  {
    "title": "Converse Unisex Run Star Crush Ox",
    "brand": "Converse",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 130.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_aac3fedf-8fd4-42ea-9201-9aa42e2ba386.jpg?width=600"
  },
  {
    "title": "Salomon XT-4 OG",
    "brand": "Salomon",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 200.0,
    "compare": 190.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/Salomon.jpg?width=600"
  },
  {
    "title": "Hoka x BEAMS Bondi 7",
    "brand": "Hoka",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 170.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_b8a60536-44df-4d08-ba27-c676123ce995.jpg?width=600"
  },
  {
    "title": "Hoka x BEAMS Bondi 7",
    "brand": "Hoka",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 170.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_0f93bd87-cb7d-407a-9f34-3b47903a5131.jpg?width=600"
  },
  {
    "title": "Dr. Martens Unisex Lowell Stud - Analine",
    "brand": "Dr. Martens",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 190.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_390f7e90-66ad-439a-962b-0915a83b9ef4.jpg?width=600"
  },
  {
    "title": "Karhu Unisex Fusion 2.0 \"Northern Lights\"",
    "brand": "Karhu",
    "dept": "unisex",
    "cat": "shoes",
    "sale": true,
    "price": 54.0,
    "compare": 150.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/Fusion_3be901a9-2ae1-4c81-b1e3-3a7ad90f06e6.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's Wellness 94 Rugby Tee",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 49.0,
    "compare": 95.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_5d34d70f-89a1-4446-902b-39f0fd8f24cf.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's Crown Tennis Disco Short",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 59.0,
    "compare": 105.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_eba3b49d-af22-466a-9b80-47e47115bee4.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's SRC Terry Polo",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 74.0,
    "compare": 160.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/TerryPolo.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's SRC Ribbed Trousers",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 74.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/RibbedTrouser.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's Bold Health Biker Short",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 44.0,
    "compare": 95.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/BoldHealthBikerShortBlack.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's Beverly Hills Horizon S\u2026",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 49.0,
    "compare": 95.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/BeverlyHillsGrayShort.jpg?width=600"
  },
  {
    "title": "Adidas Women's Samba OG",
    "brand": "Adidas",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 110.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_df702cd4-fffb-4c9b-9117-82db8e3e3b50.jpg?width=600"
  },
  {
    "title": "ASICS Women's Gel-Kayano 14",
    "brand": "ASICS",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 165.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_c2b9b335-8b3b-4e0f-84ee-89b16b11aa92.jpg?width=600"
  },
  {
    "title": "Adidas Women's Taekwondo MEI Shoes",
    "brand": "Adidas",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 110.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_01a5c929-b241-4c6c-87aa-48a323a01ecf.jpg?width=600"
  },
  {
    "title": "ASICS Women's GEL-DS TRAINER SP",
    "brand": "ASICS",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 120.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_10e91920-3555-498c-b492-4b5ea88b69ce.jpg?width=600"
  },
  {
    "title": "ASICS Women's GEL-DS TRAINER SP",
    "brand": "ASICS",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 120.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_0c66698c-0f7f-4623-ae1f-6f2a49deabd2.jpg?width=600"
  },
  {
    "title": "Salomon Women's XT-6 GTX",
    "brand": "Salomon",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 200.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_0ef0bac2-37d2-4d6c-a5af-217e5151edd7.jpg?width=600"
  },
  {
    "title": "Nike Women's Air Max 95 \"Burgundy Ash\"",
    "brand": "Nike",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 129.0,
    "compare": 190.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/19_8c0a0801-38cd-42a1-bbef-9c2d2d0285d8.jpg?width=600"
  },
  {
    "title": "Birkenstock Women's Boston Suede Leather - Na\u2026",
    "brand": "Birkenstock",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_a7cb6026-a3b6-43eb-a9c4-0629fface32f.jpg?width=600"
  },
  {
    "title": "Birkenstock Women's Arizona Leather - Narrow",
    "brand": "Birkenstock",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_3eefd07d-5820-44c0-bf49-eb18ae6dc7a4.jpg?width=600"
  },
  {
    "title": "Birkenstock Women's Arizona Leather - Narrow",
    "brand": "Birkenstock",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_785eec71-f4bf-4d14-872a-86c98ea4ba05.jpg?width=600"
  },
  {
    "title": "Adidas Women's Handball Spezial",
    "brand": "Adidas",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 94.0,
    "compare": 130.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_55275b28-42b0-428d-9751-d799e09e2046.jpg?width=600"
  },
  {
    "title": "Adidas Women's Samba OG",
    "brand": "Adidas",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 84.0,
    "compare": 120.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_57016079-2729-4855-b39e-2e489eccf045.jpg?width=600"
  },
  {
    "title": "Vans Premium Old Skool 36 Souvenir (Navy)",
    "brand": "Vans",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 125.0,
    "compare": null,
    "img": "assets/plp-1.png"
  },
  {
    "title": "Vans Premium Old Skool 36 Souvenir (Black)",
    "brand": "Vans",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 125.0,
    "compare": null,
    "img": "assets/mega-1.png"
  },
  {
    "title": "Vans Authentic (True White)",
    "brand": "Vans",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 70.0,
    "compare": null,
    "img": "assets/pdp-gallery.png"
  },
  {
    "title": "Vans Old Skool (Black/White)",
    "brand": "Vans",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 80.0,
    "compare": null,
    "img": "assets/home-1.png"
  },
  {
    "title": "Vans Sk8-Hi (Navy/White)",
    "brand": "Vans",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 90.0,
    "compare": null,
    "img": "assets/home-2.png"
  },
  {
    "title": "Vans Family Era (Pig Suede)",
    "brand": "Vans",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 85.0,
    "compare": null,
    "img": "assets/banner-vans.png"
  },
  {
    "title": "Dr. Martens Men's Delapre Penny Loafer - Repello Calf Suede MB (Field Green)",
    "brand": "Dr. Martens",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 260.0,
    "compare": null,
    "handle": "dr-martens-mens-delapre-penny-loafer-repello-calf-suede-mb-field-green",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_dfee84c5-9422-4753-90b8-c644d0c5adfe.jpg?width=600"
  },
  {
    "title": "Dr. Martens Unisex Lowell Leather Moc Toe Shoes - Black (Wild Grain)",
    "brand": "Dr. Martens",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 190.0,
    "compare": null,
    "handle": "dr-martens-unisex-lowell-leather-moc-toe-shoes-black-wild-grain",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_11e9a77e-a695-4b86-a35a-9384072594d3.jpg?width=600"
  },
  {
    "title": "Dr. Martens Women's Buzz 5-Eye Shoes - Leopard (Light Tan)",
    "brand": "Dr. Martens",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 114.0,
    "compare": 160.0,
    "handle": "dr-martens-womens-buzz-5-eye-shoes-leopard-light-tan",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/29_c8dfc554-6241-4392-9dce-0f78f58b40b1.jpg?width=600"
  },
  {
    "title": "Dr. Martens Unisex Lowell Leather Moc Toe Shoes - DMS Olive (Wild Grain)",
    "brand": "Dr. Martens",
    "dept": "unisex",
    "cat": "shoes",
    "sale": true,
    "price": 134.0,
    "compare": 190.0,
    "handle": "dr-martens-unisex-lowell-leather-moc-toe-shoes-dms-olive-wild-grain",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/46_4ce5c821-5aa7-49b5-818d-211d22f38fd3.jpg?width=600"
  },
  {
    "title": "Dr. Martens Unisex Lowell Leather Moc Toe Shoes (Cherry Red)",
    "brand": "Dr. Martens",
    "dept": "unisex",
    "cat": "shoes",
    "sale": true,
    "price": 129.0,
    "compare": 180.0,
    "handle": "dr-martens-unisex-lowell-leather-moc-toe-shoes-cherry-red",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/68_0499c51f-3cc7-4d30-ad80-4c39fa64ad60.jpg?width=600"
  },
  {
    "title": "Dr. Martens Unisex Lowell Hair On Leather Moc Toe Shoes - Pebble Emboss (Olive Green)",
    "brand": "Dr. Martens",
    "dept": "unisex",
    "cat": "shoes",
    "sale": true,
    "price": 134.0,
    "compare": 190.0,
    "handle": "dr-martens-unisex-lowell-hair-on-leather-moc-toe-shoes-pebble-emboss-olive-green",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/31_af7079e2-ed17-4b0e-919f-fba83cd4a545.jpg?width=600"
  },
  {
    "title": "Dr. Martens Men's 1460 Pascal MT (Black Wyoming)",
    "brand": "Dr. Martens",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 154.0,
    "compare": 220.0,
    "handle": "dr-martens-mens-1460-pascal-mt-black-wyoming",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/DOC_MARTENS_1460_MT.png?width=600"
  },
  {
    "title": "Dr. Martens Unisex Lowell Leather Moc Toe Shoes (Black/Analine)",
    "brand": "Dr. Martens",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 180.0,
    "compare": null,
    "handle": "dr-marten-unisex-lowell-leather-moc-toe-shoes-black-analine",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_05dfaa46-c173-4fe3-97eb-0b85daf3698d.jpg?width=600"
  },
  {
    "title": "Dr. Martens Women's Buzz 5-Eye Grizzly Leather Shoes (Dark Brown)",
    "brand": "Dr. Martens",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 140.0,
    "compare": null,
    "handle": "dr-martens-womens-buzz-5-eye-grizzly-leather-shoes-dark-brown",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/Buzz.jpg?width=600"
  },
  {
    "title": "Dr. Martens Men's 1460 Pascal Steel Toe Analine Croc Embossed Boot (Black)",
    "brand": "Dr. Martens",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 139.0,
    "compare": 210.0,
    "handle": "dr-martens-mens-1460-pascal-steel-toe-analine-croc-embossed-boot-black",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/boot_07b6f474-81b9-4771-9936-3ccaa0b497e0.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Roaring Pines 10oz. Candle",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 24.0,
    "compare": 36.0,
    "handle": "square-trade-goods-roaring-pines-10oz-candle",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/12_1ec1eb4c-72cc-4e27-bc53-6340f6846bbc.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Juniper Santal 10oz. Candle",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 24.0,
    "compare": 36.0,
    "handle": "square-trade-goods-juniper-santal-10oz-candle",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/11_3b758c23-2b91-4658-973e-71c0d08a1e63.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Palo Santo & Sage 10oz. Candle",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 24.0,
    "compare": 36.0,
    "handle": "square-trade-goods-palo-santo-sage-10oz-candle",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/10_9ff03f7f-010e-4b06-869e-4f5d1d8bae99.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Golden Cedar 10oz. Candle",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 24.0,
    "compare": 36.0,
    "handle": "square-trade-goods-golden-cedar-10oz-candle",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/9_dac03ad2-c7ef-43f2-b7e0-f3e26efd2f71.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Smoked Fig 10oz. Candle",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 24.0,
    "compare": 36.0,
    "handle": "square-trade-goods-smoked-fig-10oz-candle",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/8_9cd94d9e-bfcd-49e5-b04a-8c31f55cdaf7.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Fig & Sage 10oz. Candle",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 24.0,
    "compare": 36.0,
    "handle": "square-trade-goods-fig-sage-10oz-candle",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/7_53e7ca38-c827-47fc-9102-9888923fa317.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Roaring Pines Incense Cones",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 16.0,
    "compare": 22.0,
    "handle": "square-trade-goods-roaring-pines-incense-cones",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/6_5df3920c-e927-4729-b41b-78be1d8ccbda.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Big Sur Incense Cones",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 16.0,
    "compare": 22.0,
    "handle": "square-trade-goods-big-sur-incense-cones",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/4_e7697948-d455-4efe-b76c-7ce36410045a.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Palo Santo & Sage Incense Cones",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 16.0,
    "compare": 22.0,
    "handle": "square-trade-goods-palo-santo-sage-incense-cones",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/3_fd65f905-a25a-4db8-baa9-0218edf9c53a.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Hinoki Incense Cones",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 16.0,
    "compare": 22.0,
    "handle": "square-trade-goods-hinoki-incense-cones",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/2_c8e8bfa6-7320-48c4-bd75-08d4b6bab835.jpg?width=600"
  },
  {
    "title": "Square Trade Goods Smoked Fig Incense Cones",
    "brand": "Square Trade Goods",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 16.0,
    "compare": 22.0,
    "handle": "square-trade-goods-smoked-fig-incense-cones",
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_9828c3c7-8e31-47fc-9695-cd5c08975fa0.jpg?width=600"
  }
];

  /* Colorway duplicates share a title — collapse them so each PDP is a
     distinct product. Port note: Shopify handles already unique products. */
  const seenTitles = new Set();
  const UNIQUE = PRODUCTS.filter((p) => {
    const key = p.title.toLowerCase();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
  UNIQUE.forEach((p, i) => {
    p.id = "p" + i;
  });

  /* Infer August category types from titles so the directory can filter. */
  const TYPE_RULES = [
    { type: "socks", re: /\bsocks?\b/i },
    { type: "hats", re: /\b(hat|cap|9twenty|beanie)\b/i },
    { type: "bags", re: /\b(bag|wallet|cardholder|tote)\b/i },
    { type: "jewelry", re: /\b(jewelry|necklace|ring|bracelet)\b/i },
    { type: "tees", re: /\b(tee|t-shirt|tshirt)\b/i },
    { type: "sweatshirts", re: /\b(hoodie|sweatshirt|crewneck)\b/i },
    { type: "knits", re: /\b(sweater|knit|cardigan)\b/i },
    { type: "denim", re: /\b(denim|jeans?)\b/i },
    { type: "shorts", re: /\bshorts?\b/i },
    { type: "pants", re: /\b(pants?|trousers?|chinos?)\b/i },
    { type: "shirts", re: /\b(polo|shirt|rugby|longslee)\b/i },
    { type: "outerwear", re: /\b(jacket|coat|parka|shell)\b/i },
    { type: "sandals", re: /\b(sandal|slipper|arizona|boston)\b/i },
    { type: "boots", re: /\b(boot|martens)\b/i },
  ];
  UNIQUE.forEach((p) => {
    const hit = TYPE_RULES.find((r) => r.re.test(p.title));
    if (hit) p.type = hit.type;
    else if (p.cat === "shoes") p.type = "sneakers";
    else if (p.cat === "apparel") p.type = "shirts";
    else p.type = "bags";
  });

  const href = (p) =>
    window.AugustShop?.href(p) ||
    (p?.handle ? `product.html?h=${encodeURIComponent(p.handle)}` : `product.html?p=${p?.id || ""}`);

  const byId = (id) => UNIQUE.find((p) => p.id === id) || window.AugustShop?.cached(id) || null;

  const unique = (list) => {
    const seen = new Set();
    return list.filter((p) => {
      if (seen.has(p.title)) return false;
      seen.add(p.title);
      return true;
    });
  };

  /* Official brand directory from august-shop.com — not just brands we
     currently have product cards for. Port note: Shopify collections. */
  const BRANDS = [
    "19-69",
    "Adidas",
    "Advisory Board Crystals",
    "Agaric Fly",
    "AIAIAI",
    "Arc'teryx",
    "ASICS",
    "August",
    "Awake NY",
    "b.Eautiful",
    "Birkenstock",
    "Boiler Room",
    "Boy Smells",
    "Brain Dead",
    "Butter Goods",
    "Carhartt WIP",
    "Carne Bollente",
    "Converse",
    "Dime",
    "District Vision",
    "Dr. Martens",
    "Dude. Your Team Socks.",
    "Eight & Bob",
    "Engineered Garments",
    "Estudio Niksen",
    "Found",
    "Full Court Press",
    "G-Shock",
    "HIDDEN.NY",
    "HOKA®",
    "Honor the Gift",
    "James Oro",
    "Jason Markk",
    "Jungles",
    "K-Swiss",
    "Kardo",
    "Karhu",
    "Katie Weber",
    "KEEN",
    "KIDSUPER STUDIOS",
    "Kids Of Immigrants",
    "Lady White Co.",
    "Les Deux",
    "Maison Mihara Yasuhiro",
    "Mister Green",
    "Museum of Peace & Quiet",
    "Needles",
    "Neighborhood",
    "Nike",
    "Oakley Factory Team",
    "On",
    "Online Ceramics",
    "One Of These Days",
    "OrSlow",
    "Paradise NYC",
    "Pass~Port",
    "Pleasures",
    "Puma",
    "Quiet Golf",
    "Reebok",
    "ROA",
    "Salomon",
    "Satisfy",
    "Saucony",
    "Serge DeNimes",
    "Service Works",
    "Sky High Farm Workwear",
    "Sporty & Rich",
    "Square Trade Goods",
    "Stan Ray",
    "Stepney Workers Club",
    "Stüssy",
    "Suicoke",
    "Tears of Venus",
    "UGG",
    "Velva Sheen",
    "Vans",
    "Wax London",
    "Wythe",
  ];

  const brandKey = (name) =>
    String(name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/®/g, "")
      .replace(/[^a-z0-9]+/g, "");

  const brandMatch = (productBrand, selected) => {
    const key = brandKey(productBrand);
    return selected.some((b) => brandKey(b) === key);
  };

  const brandDirHtml = () => {
    const cols = [
      { head: "123 - G", items: [] },
      { head: "H - O", items: [] },
      { head: "P - Z", items: [] },
    ];
    BRANDS.forEach((name) => {
      const ch = name.trim().charAt(0).toUpperCase();
      cols[ch < "H" ? 0 : ch < "P" ? 1 : 2].items.push(name);
    });
    return `<div class="brand-dir" data-brand-dir>${cols
      .map(
        (col) => `
      <div class="brand-dir__col">
        <p class="brand-dir__head">${col.head}</p>
        ${col.items
          .map((n) => `<a href="collection.html?brand=${encodeURIComponent(n)}">${n}</a>`)
          .join("")}
      </div>`
      )
      .join("")}</div>`;
  };

  const brands = () => BRANDS.slice();

  /* Official category directory from august-shop.com. */
  const CATEGORIES = [
    {
      head: "Apparel",
      href: "collection.html?cat=apparel",
      items: [
        { label: "Tees", type: "tees" },
        { label: "Sweatshirts", type: "sweatshirts" },
        { label: "Knits", type: "knits" },
        { label: "Pants", type: "pants" },
        { label: "Denim", type: "denim" },
        { label: "Shorts", type: "shorts" },
        { label: "Shirts", type: "shirts" },
        { label: "Outerwear", type: "outerwear" },
      ],
    },
    {
      head: "Footwear",
      href: "collection.html?cat=shoes",
      items: [
        { label: "Sneakers", type: "sneakers" },
        { label: "Shoes + Boots", type: "boots" },
        { label: "Sandals + Slippers", type: "sandals" },
      ],
    },
    {
      head: "Accessories",
      href: "collection.html?cat=accessories",
      items: [
        { label: "Hats", type: "hats" },
        { label: "Bags + Wallets", type: "bags" },
        { label: "Jewelry", type: "jewelry" },
        { label: "Socks", type: "socks" },
      ],
    },
    {
      head: "Objects",
      href: "collection.html?cat=objects",
      items: [
        { label: "Candles + Incense", type: "candles" },
        { label: "Ceramics", type: "ceramics" },
        { label: "Home Goods", type: "home" },
        { label: "Fragrance + Skin", type: "fragrance" },
        { label: "Publications", type: "publications" },
        { label: "Vinyl", type: "vinyl" },
        { label: "Gift Cards", type: "gift-cards" },
      ],
    },
  ];

  const typeLabel = (type) => {
    for (const col of CATEGORIES) {
      const hit = col.items.find((i) => i.type === type);
      if (hit) return hit.label;
    }
    return type;
  };

  const catDirHtml = () =>
    `<div class="brand-dir brand-dir--cats" data-cat-dir>${CATEGORIES.map(
      (col) => `
      <div class="brand-dir__col">
        <a class="brand-dir__head" href="${col.href}">${col.head}</a>
        ${col.items
          .map((item) => `<a href="collection.html?type=${encodeURIComponent(item.type)}">${item.label}</a>`)
          .join("")}
      </div>`
    ).join("")}</div>`;

  const related = (p, n = 4) =>
    unique(
      UNIQUE.filter((x) => x.id !== p.id && (x.cat === p.cat || x.brand === p.brand))
    ).slice(0, n);

  const sizesFor = (p) =>
    p.cat === "shoes"
      ? ["8", "9", "10", "11", "12"]
      : p.cat === "apparel"
        ? ["S", "M", "L", "XL"]
        : ["OS"];

  /* Filter by homepage prefs. Unisex items belong to every department. */
  const feed = (hp, limit) => {
    const dept = (hp && hp.department) || "all";
    const cat = (hp && hp.category) || "all";
    const saleOnly = !!(hp && hp.saleOnly);
    const out = UNIQUE.filter((p) => {
      if (dept !== "all" && p.dept !== dept && p.dept !== "unisex") return false;
      if (cat !== "all" && p.cat !== cat) return false;
      if (saleOnly && !p.sale) return false;
      return true;
    });
    return limit ? out.slice(0, limit) : out;
  };

  const money = (n) => "$" + n.toFixed(2);

  const priceHtml = (p) =>
    p.sale && p.compare
      ? `<span class="price-was">${money(p.compare)}</span> ${money(p.price)}`
      : money(p.price);

  /* Matches the PLP/home .product-card markup exactly */
  const cardHtml = (p) => `
    <a class="product-card" href="${href(p)}">
      <div class="product-card__media"><img src="${p.img}" alt="${p.title}" loading="lazy" /></div>
      <div class="product-card__meta">
        <div class="product-card__brand">${p.brand}</div>
        <div class="product-card__title">${p.title}</div>
        <div class="product-card__price">${priceHtml(p)}</div>
      </div>
    </a>`;

  /* Responsive sources — Shopify's CDN resizes via the width param, so one
     asset serves every breakpoint. Returns "" for non-CDN (local) images. */
  const srcset = (url) =>
    /width=\d+/.test(url)
      ? [400, 600, 900, 1400]
          .map((w) => `${url.replace(/width=\d+/, `width=${w}`)} ${w}w`)
          .join(", ")
      : "";

  return {
    srcset,
    PRODUCTS: UNIQUE,
    BRANDS,
    byId,
    href,
    unique,
    brands,
    brandKey,
    brandMatch,
    brandDirHtml,
    CATEGORIES,
    catDirHtml,
    typeLabel,
    related,
    sizesFor,
    feed,
    money,
    priceHtml,
    cardHtml,
  };
})();

/* ── Cart + Orders stores ─────────────────────────────────────
   localStorage-backed; every write dispatches august:cart-changed so
   badges/pages stay live. Port note: cart → Shopify Ajax Cart API,
   orders → customer.orders in Liquid. */
window.AugustCart = (() => {
  const CART_KEY = "august_cart";
  const ORDERS_KEY = "august_orders";

  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  const write = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("august:cart-changed"));
  };

  const items = () => read(CART_KEY);

  const add = (id, size) => {
    const list = items();
    const found = list.find((i) => i.id === id && i.size === size);
    if (found) found.qty += 1;
    else list.push({ id, size, qty: 1 });
    write(list);
  };

  const removeAt = (index) => {
    const list = items();
    list.splice(index, 1);
    write(list);
  };

  const clear = () => write([]);

  const count = () => items().reduce((n, i) => n + i.qty, 0);

  const subtotal = () =>
    items().reduce((sum, i) => {
      const p = window.AugustCatalog.byId(i.id);
      return sum + (p ? p.price * i.qty : 0);
    }, 0);

  const orders = () => read(ORDERS_KEY);

  const placeOrder = () => {
    const list = items();
    if (!list.length) return null;
    const order = {
      no: "AUG-" + (2418 + orders().length),
      date: Date.now(),
      items: list,
      total: subtotal(),
      status: "In transit",
    };
    const all = orders();
    all.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
    clear();
    return order;
  };

  return { items, add, removeAt, clear, count, subtotal, orders, placeOrder };
})();
