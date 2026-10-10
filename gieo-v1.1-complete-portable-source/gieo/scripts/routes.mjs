import {content} from '../src/content.js';
export const routes=['/','/explore','/stories','/sanctuary','/garden','/library','/about',...content.lessons.map(x=>'/explore/'+x.slug),...content.stories.map(x=>'/stories/'+x.slug)];
