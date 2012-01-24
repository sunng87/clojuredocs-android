package info.sunng.clojuredocs;

import android.os.Bundle;
import com.phonegap.DroidGap;


/**
 * User: Sun Ning<classicning@gmail.com>
 * Date: 1/23/12
 * Time: 12:07 PM
 */
public class App extends DroidGap {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}
