import { Error } from '../models/openapi';
import { createSystemError } from './error-util';
import {
  ApprovalCommentType,
  ApprovalStatus,
  Product,
  ProductApproval,
  ProductApprovalComment,
} from '../__generated__/linkedup-web-api-client';

const randomPrice = () => Math.floor(Math.random() * 500); // 0
const randomLikes = () => Math.floor(Math.random() * 101); // 0
const randomRating = () =>
  Number.parseFloat((Math.random() < 0.999999 ? Math.random() * 5 : 5).toFixed(2));

const products: Product[] = [
  {
    id: '101',
    name: 'Handmade Scarf',
    summary: 'Keep you warm in winter',
    imageUrl: 'https://linkedup-web-app-media-bucket.s3.eu-west-2.amazonaws.com/product_015.jpeg',
    rating: 0,
    cost: randomPrice(),
    likes: 0,
    sellerId: 'S000000571',
    seller: 'Connor Chu',
    sellerClass: '4E-1',
  },
  {
    id: '102',
    name: 'Airpod case',
    summary: 'Simple is the best',
    imageUrl: 'https://linkedup-web-app-media-bucket.s3.eu-west-2.amazonaws.com/product_016.jpeg',
    rating: randomRating(),
    cost: randomPrice(),
    likes: randomLikes(),
    sellerId: 'S000000571',
    seller: 'Connor Chu',
    sellerClass: '4E-1',
  },
  {
    id: '103',
    name: 'Soft tissue',
    summary: 'For cleaning ass 抹屎忽專用',
    imageUrl: 'https://linkedup-web-app-media-bucket.s3.eu-west-2.amazonaws.com/product_017.jpeg',
    rating: randomRating(),
    cost: randomPrice(),
    likes: randomLikes(),
    sellerId: 'S000000571',
    seller: 'Connor Chu',
    sellerClass: '4E-1',
  },
];

const comment: ProductApprovalComment[] = [
  {
    type: ApprovalCommentType.CONVERSATION,
    commentBy: {
      id: '9000',
      email: 'system@linkedup.org',
      name: {
        English: 'Profanity Checker',
      },
    },
    commentAt: new Date().toISOString(),
    comment:
    'Profanity score : 72 / 100\nSensitive words : ass, 屎忽'
  },
  {
    type: ApprovalCommentType.CONVERSATION,
    commentBy: {
      id: '9001',
      email: '9001@linkedup.org',
      name: {
        English: 'Sharon Lee (Teacher)',
      },
    },
    commentAt: new Date().toISOString(),
    comment:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eu nibh est. Praesent consequat turpis bibendum massa blandit ullamcorper. Nunc condimentum porttitor urna, non fringilla elit. In sed neque laoreet, pellentesque tellus ut, vestibulum tortor. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Suspendisse at tellus sed justo sollicitudin sagittis at quis dui. Vivamus eu ante id risus porta porttitor ultrices quis dolor. Duis consectetur, urna in imperdiet dignissim, odio ex dapibus nulla, a fermentum nisi libero ut velit. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer rhoncus turpis ac ipsum ullamcorper, ut lacinia augue eleifend. Nunc mollis, arcu nec maximus viverra, quam dui efficitur nunc, et iaculis dolor nisl vitae ipsum.',
  },
  {
    type: ApprovalCommentType.REJECTION,
    commentBy: {
      id: '9001',
      email: '9001@linkedup.org',
      name: {
        English: 'Sharon Lee (Teacher)',
      },
    },
    commentAt: new Date().toISOString(),
    comment:
      'Cras et eleifend felis, eu ultrices enim. Mauris ipsum neque, lobortis in ante aliquet, euismod elementum neque. Vivamus ultricies erat a est lacinia, vel porta erat tincidunt. Integer sollicitudin commodo tincidunt. Cras tempus tempor rutrum. Ut iaculis, ante ut condimentum condimentum, felis nisi dapibus mi, pellentesque sodales dolor massa eget tellus. Ut pretium, enim in aliquet consectetur, velit arcu fermentum nunc, ac fringilla elit velit vel tellus. Fusce ultrices aliquet lorem, sit amet accumsan urna laoreet id. Donec interdum nisl vitae rhoncus placerat. Pellentesque consectetur velit nisi, nec tincidunt est ullamcorper eget. Vestibulum at est ac ante facilisis interdum sed ac neque. Morbi in ipsum sit amet mi fermentum porta. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum euismod diam id mi finibus tristique. In hac habitasse platea dictumst.',
  },
  {
    type: ApprovalCommentType.CONVERSATION,
    commentBy: {
      id: '9002',
      email: '9002@linkedup.org',
      name: {
        English: 'Connor Chu',
      },
    },
    commentAt: new Date().toISOString(),
    comment:
      'Suspendisse a lectus ac tortor volutpat auctor pellentesque eget libero. Suspendisse ultricies libero in erat efficitur placerat. Mauris purus dui, varius at purus in, vehicula semper magna. Duis augue nisl, pharetra sit amet tellus ac, dignissim sagittis ex. Maecenas sed vulputate arcu. Curabitur commodo aliquet convallis. Suspendisse potenti. Vestibulum feugiat quam nec purus porta, id ultricies ligula pretium. Quisque semper dapibus massa, non tempus est consectetur nec. Fusce elit nibh, fringilla a convallis id, maximus vitae metus. Aliquam eget odio consequat, ultrices dolor eget, porta urna.',
  },
];

export const findProductApproval = async (): Promise<ProductApproval[] | Error> => {
  try {
    return products.map((p) => ({
      id: `9${p.id}`,
      product: p,
      status: ApprovalStatus.PENDING,
      comments: p.id === '103' ? comment : comment.filter(c => c.commentBy.id !== '9000'),
    }));
  } catch (error: any) {
    return createSystemError(error);
  }
};
